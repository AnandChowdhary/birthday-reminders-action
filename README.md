# 🎁 Birthday Reminders Action

Get daily Telegram messages for birthday reminders using GitHub Actions.

<img alt="Telegram screenshot" src="https://user-images.githubusercontent.com/2841780/199228083-74f05361-c7ab-411a-bbf3-040d216cc5d9.jpeg" width="400">

## 🎈 How it works

Using scheduled workflows, you will receive a Telegram message once every day with a list of birthdays, and once every week with upcoming birthdays.

## 🛠️ Setup

Create a new repository with the following environment variables:

- `TELEGRAM_TOKEN` - Bot token
- `TELEGRAM_CHAT_ID` - Chat ID

Next, create a `birthdays.yml` file with a list of birthdays you want to track:

```yaml
- name: Anand Chowdhary
  day: 29
  month: 12
  year: 1997
- name: Sukriti Kapoor
  day: 15
  month: 9
  gift: true
```

Each person should have a "name" (string), "month" (number), and "day" (number). Optionally, you can add "year" (number) to find out how many years old they are, "gift" (boolean) for whether or not you want to be reminded to purchase a gift, and "me" (boolean) for a wish for yourself.

Then, create two GitHub Actions workflow files. First, `.github/workflows/daily.yml`:

```yaml
name: Daily CI
on:
  schedule:
    - cron: "0 8 * * *"
  workflow_dispatch:
jobs:
  weekly:
    name: Daily birthday reminders
    runs-on: ubuntu-20.04
    steps:
      - name: Checkout
        uses: actions/checkout@v2.3.3
      - name: Send message
        uses: AnandChowdhary/birthday-reminders-action@HEAD
        with:
          command: birthdays-today
        env:
          TELEGRAM_TOKEN: ${{ secrets.TELEGRAM_TOKEN }}
          TELEGRAM_CHAT_ID: ${{ secrets.TELEGRAM_CHAT_ID }}
```

And `.github/workflows/weekly.yml`:

```yaml
name: Weekly CI
on:
  schedule:
    - cron: "0 8 * * 1"
  workflow_dispatch:
jobs:
  weekly:
    name: Weekly birthday reminders
    runs-on: ubuntu-20.04
    steps:
      - name: Checkout
        uses: actions/checkout@v2.3.3
      - name: Send message
        uses: AnandChowdhary/birthday-reminders-action@HEAD
        with:
          command: upcoming-birthdays
        env:
          TELEGRAM_TOKEN: ${{ secrets.TELEGRAM_TOKEN }}
          TELEGRAM_CHAT_ID: ${{ secrets.TELEGRAM_CHAT_ID }}
```

You can manually trigger the workflow to test it out.

## 📄 License

- Code: [MIT](./LICENSE) © [Anand Chowdhary](https://anandchowdhary.com)
- "GitHub" is a trademark of GitHub, Inc.
