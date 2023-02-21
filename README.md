# eCLAT-backend
## How to install

### Using Git (recommended)

1.  Clone the project from github. Change "myproject" to your project name.

```bash
https://github.com/netgroup/eCLAT-backend.git
```

### Using manual download ZIP

1.  Download repository
2.  Uncompress to your desired directory

### Install npm dependencies after installing (Git or manual download)

```bash
cd myproject
npm install
```

### Setting up environments

1.  Create a file named `.env` on root directory of project.
2.  The file `.env` is already ignored, so you never commit your credentials.
4.  Add the values to the file of your environment. 

## Project structure

```sh
.
├── app.js
├── package.json
├── bin
│   └── www
├── controllers
│   ├── AuthController.js
|   ├── UserController.js
│   └── PackageController.js
├── models
│   ├── PackageModel.js
│   ├── ReleaseModel.js
│   └── UserModel.js
├── routes
│   ├── api.js
│   ├── auth.js
│   ├── package.js
│   └── user.js
├── middlewares
│   └──  jwt.js
└── helpers
    └── apiResponse.js

```

## How to run

### Running API server locally

```bash
npm run start
```

### Creating new models

If you need to add more models to the project just create a new file in `/models/` and use them in the controllers.

### Creating new routes

If you need to add more routes to the project just create a new file in `/routes/` and add it in `/routes/api.js` it will be loaded dynamically.

### Creating new controllers

If you need to add more controllers to the project just create a new file in `/controllers/` and use them in the routes.

## Bugs or improvements

Every project needs improvements, Feel free to report any bugs or improvements. Pull requests are always welcome.

