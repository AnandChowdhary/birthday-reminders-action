import { parse } from "yaml";
import { readFile } from "node:fs/promises";
import { z } from "zod";
import { getInput, setFailed } from "@actions/core";
import got from "got";

export const app = async () => {
  const command = getInput("command");
  if (command !== "birthdays-today" && command !== "upcoming-birthdays")
    throw new Error("Invalid command");

  if (!process.env.TELEGRAM_TOKEN)
    throw new Error("Missing environment variable TELEGRAM_TOKEN");
  if (!process.env.TELEGRAM_CHAT_ID)
    throw new Error("Missing environment variable TELEGRAM_CHAT_ID");

  const send = async (text: string) => {
    await got.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
      {
        headers: { "Content-Type": "application/json" },
        json: { chat_id: process.env.TELEGRAM_CHAT_ID, text },
      }
    );
  };

  const file = await readFile("birthdays.yml", "utf-8");
  const yaml = z
    .array(
      z.object({
        name: z.string(),
        day: z.number(),
        month: z.number(),
        year: z.number().optional(),
        gift: z.boolean().optional(),
        me: z.boolean().optional(),
      })
    )
    .parse(parse(file));

  const today = new Date();
  const todayMonth = today.getUTCMonth() + 1;
  const todayDay = today.getUTCDate();
  const todayYear = today.getUTCFullYear();

  const nextBirthdays = yaml.map((data) => {
    const _day = data.day < 10 ? `0${data.day}` : data.day.toString();
    const _month = data.month < 10 ? `0${data.month}` : data.month.toString();
    const birthdayThisYear = new Date(`${todayYear}-${_month}-${_day}`);
    if (birthdayThisYear < today)
      return {
        ...data,
        nextBirthday: new Date(`${todayYear + 1}-${_month}-${_day}`),
      };
    return { ...data, nextBirthday: birthdayThisYear };
  });

  if (command === "birthdays-today") {
    const todayBirthdays = yaml.filter(
      ({ day, month }) => month === todayMonth && day === todayDay
    );
    if (todayBirthdays.length)
      await send(`
Birthdays today:
${todayBirthdays
  .map(
    ({ name, year, me, gift }) =>
      ` • ${name}${year ? ` - ${todayYear - year} years old` : ""}${
        me ? " - 🎂🎉🎈 happy birthday!" : ""
      }${gift ? " 🎁" : ""}`
  )
  .join("\n")}
`);
  } else {
    const upcomingBirthdays = nextBirthdays.filter(
      ({ nextBirthday, me }) =>
        !me &&
        nextBirthday.getTime() - today.getTime() <= 1000 * 60 * 60 * 24 * 7
    );
    if (upcomingBirthdays.length)
      await send(`
Upcoming birthdays:
${upcomingBirthdays
  .map(
    ({ name, year, gift }) =>
      ` • ${name}${year ? ` - ${todayYear - year} years old` : ""}${
        gift ? " 🎁" : ""
      }`
  )
  .join("\n")}
`);
  }
};

app().catch((error) => setFailed(error.message));
