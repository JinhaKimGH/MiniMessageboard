# Mini Messageboard

This app lets you chat with others within small private communities (clubs) that are centered on a certain topic.

This app utilizes node and express for the routing, pug for the page views, and MongoDB to store data.

NOTE: The backend may take some time to boot up when initially acessing the site, after booting up, the backend requests should not take long.

## 🔗 Website Link

You can access this app [here](https://minimessageboard-wtww.onrender.com/forum)!

## 🪄 Features

Users can:

- Create an account
- Log in
- Send messages
- Create private communities
- Add members to communities
- Request to join communities

Other:

- Utilizes [BcryptJS](https://www.npmjs.com/package/bcrypt) for password encryption
- Utilizes [MongooseJS](https://mongoosejs.com/docs/) to store and access data

## 📸 Screenshots

![Homepage](/screenshots/homepage.png)
![Login Page](/screenshots/LogIn.png)
![Clup Page Feed](/screenshots/ClubPageFeed.png)

## Environment Variables

To run this project locally, you will need to add the following variables to a .env file.

`MONGODBURI` -> [MongoDBURI for database](https://www.mongodb.com/docs/manual/reference/connection-string/)

## Run Locally

Clone the project

```bash
  git clone git@github.com:JinhaKimGH/MiniMessageboard.git
```

Go to the project directory

```bash
  cd MiniMessageboard
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run start
```

## 🔗 Links

[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/jinha-kim/)

## License

[MIT](https://choosealicense.com/licenses/mit/)
