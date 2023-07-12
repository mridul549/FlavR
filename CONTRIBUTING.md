# Contributing

* Setting up the .env file

```bash
    MONGOOSE_CONNECTION_STRING = <Enter the value>

    CLOUDINARY_CLOUD_NAME = <Enter the value>
    CLOUDINARY_API_KEY = <Enter the value>
    CLOUDINARY_API_SECRET = <Enter the value>

    TOKEN_SECRET = <Enter the value>

    REDIS_HOST = <Enter the value>
    REDIS_PORT = <Enter the value>
    REDIS_PASSWORD = <Enter the value>
    REDIS_USERNAME = <Enter the value>
    REDIS_URI = <Enter the value>

    CF_APP_ID = <Enter the value>
    CF_API_KEY = <Enter the value>

    GOOGLE_CLIENT_ID = <Enter the value>
    GOOGLE_CLIENT_SECRET = <Enter the value>
    GOOGLE_REDIRECT_URI = <Enter the value>
    GOOGLE_REFRESH_TOKEN = <Enter the value>

```

* Mongoose Connection String:
    * Create an account on MongoDB Atlas [here](https://www.mongodb.com/) and sign in to it.
    * After getting into the dashboard, create a new cluster.
    * After creating a new cluster, click on connect > compass, here you'll find your `MONGOOSE_CONNECTION_STRING`
    * Paste this connection string in the .env file.

* Cloudinary
    * Create a new [Cloudinary](https://cloudinary.com/) account and log into it.
    * Go to settings > access keys, here you'll get `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` and your `CLOUDINARY_CLOUD_NAME`.

* Redis
    * Create a new Redis enterprise account [here](https://redis.com/redis-enterprise-cloud/overview/) and login.
    * Create a new subscription with a fixed plan (free one).
    * After this open the configuration of the newly created subscription, here you'll find the secrets as following:
        * **Public Endpoint:** `REDIS_HOST` (the ending of the string would look like this redislabs.com:12670, shortend the string till redislabs.com).
        * `REDIS_PORT`: This is present in the public endpoint, just put it here.
        * **Default user password:** `REDIS_PASSWORD`
        * **Default User:** `REDIS_USERNAME`
        * In the public endpoint section you will find a connect button, click on Redis CLI and copy paste the url as `REDIS_URI`.

* Cashfree
    * Create a new [Cashfree](https://cashfree.com) account and login.
    * Once in the dashboard, click on **Try test environment** under payment gateway section.
    * Click on **developers** from the sidebar and then the **API Keys** hyperlink.
    * Here you'll find your `CF_APP_ID` as App Id and `CF_API_KEY` as Secret key.

* Gmail API
    * To set this up, watch this [video](https://youtu.be/-rcRf7yswfM).



