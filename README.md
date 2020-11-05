# Securebin

Securebin is an open-source encrypted Pastebin, where the data you paste completely secret, and can only be viewed with a password.

**Note:** This API has no client. The API has no public documentation as of right now, but I am working on creating one. This project is a Work In Progress.

## How to self-host

Clone the repository to your local machine where you want to host it

```bash
git clone https://github.com/securebin/api.git
```

Then, you need to install all packages
```bash
# npm
npm install

# yarn
yarn install
```

The API also depends on some environment variables. Create a `.env` file in the root directory of the project (outside `src`)

Populate the `.env` file with the following:
```
PORT=<port>
MONGODB_URI=mongodb://<ip>:<port>/<database>
CRYPTO_EMAIL_SECRET=random_32_bytes_tring
JWT_SECRET=random_jwt_secret
HMAC_IP_SECRET=random_ip_hashing_secret
ENVIRONMENT=production|development|staging
```

**Note:** `CRYPTO_EMAIL_SECRET` *has* to be 32 bytes long to work

## Running the API
In order to run the API, you need to run `npm start`. If you get any errors, feel free to reach out for help in issues.

## License
[MIT](https://choosealicense.com/licenses/mit/)