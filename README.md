# library-system

- This project about creating a demo project for Simple Library System:

## Project Requirements
 
- That helps in List books
- Borrowers and what they borrowed and when.
- Keep track of books are out & for books are overdue.

## Requirements

- NodeJs: Backend runtime (>= 16.18)
- Postgresql: Database Server (14.11)
- Yarn package manager

## Installation instructions

- Clone project : `git clone https://github.com/seiftahawy54/library-system.git`
- Go to directory : `cd library-system`
- Create `.env` file for environment variables : `touch .env`
- Add important variables before running the app:
  - `NODE_ENV` : to change the project environment depending on where the project will run
  - `PORT` : to specify which port will project run
  - `DB_URL` : Database URI to link the project to database
    - _Make sure that Database server is running on correct port with correct credentials_
  - `DB_URL_TEST` : _if you are planning to run tests_
    - _Make sure to separate development database and the testing database because in testing mode all data are removed to make sure all the tests are accurate_
  - `BACKEND_HOST`: Includes information about the host link because some features are depending on it.
- Install dependencies : `yarn install`
  - The app will be accessible at ``http://localhost:PORT``
- Run the project in dev mode : `yarn dev`
- Run tests : `yarn test`
- To create the API documentation : `yarn doc`

## Notes

- The documentation for API is at doc

![alt ERD for DB](https://github.com/seiftahawy54/library-system/blob/master/ERD_Image.png?raw=true)


