
# ![flavr (1)](https://github.com/mridul549/FlavR-Backend/assets/94969636/98f80461-cf23-4e8b-b6d2-3a6a435c434e)


This food ordering project is a comprehensive solution that facilitates a seamless ordering process for users while providing efficient management tools for outlet owners. The project consists of two distinct apps developed using Flutter: a user app and an owner app.

The user app allows customers to conveniently browse and select food items from local food outlets. Once the order is placed, users are seamlessly redirected to a secure payment gateway to complete the transaction. This ensures a smooth and secure payment process. After successful payment, the order details are automatically forwarded to the respective outlet for confirmation.

Upon confirmation by the outlet, an order number is assigned, and users are notified through the app. This eliminates the need for users to physically visit the outlet or repeatedly inquire about the status of their order. Users can simply wait for the notification and then proceed to the food outlet for order collection.

On the other hand, the owner app provides outlet owners with powerful tools to efficiently manage their operations. Owners can view and process incoming orders, keeping track of order details, delivery preferences, and customer information. The app also facilitates seamless communication with users, enabling owners to provide updates or address any concerns regarding the order.

To further enhance outlet management, a dedicated website using React.js has been developed specifically for owners. This website serves as a comprehensive outlet management system, allowing owners to perform CRUD operations on their menu and outlet(s), and monitor the incoming orders. It also provides the owner with various analytics about their outlet like revenue generated, various outlets comparison and products ordering frequency. The website also provides a user-friendly interface and can be easily accessed from larger screens, making it ideal for use in the outlet's kitchen.

The backend of the project is built using Node.js, Express, MongoDB, Redis, and Firebase. These technologies ensure efficient data management, real-time notifications, and seamless integration between the user app, owner app, and the website.

Overall, this project revolutionizes the food ordering experience by providing a convenient and streamlined solution for users while empowering outlet owners with efficient management tools. It enhances customer satisfaction, reduces waiting times, and increases operational efficiency for food outlets.


## Key Features

- User-Friendly Ordering
- Real time management of orders by the outlet
- Secure Payment Gateway
- Cross platform functionality
- Various Analytics tools available
- User app, Owner app, and Website work together in sync


## Tech Stack

**Website:** ReactJS, Context API, and Bootstrap.

**User and Owner App:** Flutter, Firebase, and Bloc.

**Server:** NodeJS, Express, MongoDB, Redis and Firebase.


# Description of the Apps

This section describes in detail the working of the User app, the owner app, and the Website (All three of these are still in development phase, so there might be some bugs).

## The User app

## The Website
The website developed as part of the food ordering project serves as a comprehensive outlet management system for owners. Built using **React.js**, the website offers a user-friendly interface and a range of features that facilitate efficient management of the outlet's operations.

#### Links
* Repo https://github.com/mridul549/ownerweb
* Website live at https://flavr.onrender.com/

#### Key features 

* **Outlet Menu Management:** The website enables owners to perform CRUD operations on the menu. They can easily add, update, and delete food items, ensuring that the menu is always up to date and reflects the available options.

* **Outlet Information:** Owners can update important information about their outlet, such as contact details, address, working hours

* **Order Tracking:** The website provides a centralized platform for owners to track and manage incoming orders. Owners can view details of each order, including the items ordered, delivery preferences, and customer information.

* **Real-Time Notifications:** The website offers real-time notifications to owners, keeping them informed about new orders.

* **Analytics and Reporting:** The website includes analytics features that provide owners with valuable insights into their business. They can access data on popular menu items, sales performance, and different outlets comparison (the ones they own).

#### Demo

* Menu
    * Add a product

        * Adding the first-ever product 
            * Add a **new** category
              ![Add category- Final](https://github.com/mridul549/FlavR-Backend/assets/94969636/1760a9c8-72cc-4b27-a21e-5123c13a7a30)

            * All the products belonging to this category can be added here.
              ![Screen Recording 2023-07-11 at 6 55 08 PM](https://github.com/mridul549/FlavR-Backend/assets/94969636/ba4c0806-609b-4ac7-b665-701ed5838abb)
              
        * Adding products in already existing category
            * Click on the edit icon next to a category
              ![AddProductByEdit](https://github.com/mridul549/FlavR-Backend/assets/94969636/cb10d2cb-9569-415b-af90-79dd2bb49cf1)

            * New products can be added here

    * Update a product
        * Select the category of which's product you want to update
        * Find the product and click on the edit icon of the same.
        * You can edit the product now
           ![Update product](https://github.com/mridul549/FlavR-Backend/assets/94969636/3df0e9e3-5b0b-439d-8390-431189726679)


    * Delete a product
        * Follow the same steps as the update method but instead of clicking on the edit button, you can click on the delete button.
            ![Delete Product](https://github.com/mridul549/FlavR-Backend/assets/94969636/e1ce635d-22f8-40dc-83fc-5a98617aba77)


* CRUD operations for the outlet
    * Get all outlets
      ![Get all outlets](https://github.com/mridul549/FlavR-Backend/assets/94969636/07d98367-7c01-4e6c-b817-7ee3d1718f59)

    * Add an outlet
      ![Add outlet](https://github.com/mridul549/FlavR-Backend/assets/94969636/8b30040d-3481-443a-8aa5-f8c9c9dec222)

    * Update an outlet

    * Delete an outlet
    
* Handling of incoming orders
    * Contains three sections
        * **Pending Confirmation:** Once a new order arrives, it will come in this section, the owner would first have to accept an order or reject it selecting the proper reason.
        * **Active Orders:** Once an order is accepted, it is brought to this section along with the assignment of the order number. 
        * **Ready Orders:** This section contains orders that are marked as prepared and ready for pickup.
    * The entire order handling process works in real time with notifications being sent to the user at each stage automatically.
   
   https://github.com/mridul549/FlavR/assets/94969636/86c910b9-6038-44fa-a042-0f943e07313c


* Analytics Dashboard
    * The analytics section provides an owner with **three** important pieces of information.
        * **Revenue Generated:** This lets the owner know how much revenue was generated by an outlet on a given date, month, or year.
          
          <img width="523" alt="Screenshot 2023-07-11 at 11 15 08 PM" src="https://github.com/mridul549/FlavR-Backend/assets/94969636/f6e00a8c-1037-4c74-9e74-c96c41f36180">

        * **Outlets comparison:** This lets the owner compare multiple outlets based on revenue generated on a given day, month, or year.
          
          <img width="527" alt="Screenshot 2023-07-11 at 11 15 40 PM" src="https://github.com/mridul549/FlavR-Backend/assets/94969636/74a59339-a073-49b1-b075-1ba1512cfe86">

        * **Products comparison:** This lets the owner compare the performance of the various products of the outlet based on the quantity ordered on a given day, month, or year.
          
          <img width="1048" alt="Screenshot 2023-07-11 at 11 15 56 PM" src="https://github.com/mridul549/FlavR-Backend/assets/94969636/4cde9aca-33fc-40b6-8c91-1dea0abae86d">

## Run Locally

To run Locally, go to the respective **repos** of the apps or the website, and follow the steps mentioned there.

* **Website:** https://github.com/mridul549/ownerweb
* **User App:** https://github.com/sanyam12/FlavR
* **Owner App:** https://github.com/sanyam12/FlavR

For the **server**, follow the below mentioned steps:

* Clone the project

```bash
  git clone https://github.com/mridul549/FlavR
```

* Go to the project directory

```bash
  cd FlavR
```

* Install dependencies

```bash
  npm install
```

* Create a new file named **.env** in the root directory, and add the following secrets there.

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

    FB_API_KEY = <Enter the value>
    FB_AUTH_DOMAIN = <Enter the value>
    FB_PROJECT_ID = <Enter the value>
    FB_STORAGE_BUCKET = <Enter the value>
    FB_MESSAGING_SENDER_ID = <Enter the value>
    FB_APP_ID = <Enter the value>
    FB_MEASUREMENT_ID = <Enter the value>
```

To setup the environment variables, see `contributing.md`.

* Start the server

```bash
  npm start
```

* The server should be up and running on **PORT 3001**.


## Documentation

The Documentation of the REST-API can be found [here](https://documenter.getpostman.com/view/21883208/2s93m4ZPc1). This Documentation was created with the help of **Postman**.



## Contributing

Contributions are always welcome!

See `contributing.md` for ways to get started.

Please adhere to this project's `code of conduct`.

### Current Contributors

| Developed                                | Contributors             |
|------------------------------------------|--------------------------|
| The User and the Owner app using Flutter | @sanyam12 and @Akshi-ta  |
| The Website using ReactJS                | @mridul549 and @chahat30 |
| The Server using Nodejs                  | @mridul549               |


## FAQ

#### Q- In the user app, when multiple people place orders simultaneously, how does the system allocate unique order numbers to ensure accurate tracking and management of each order?

**A-** To handle concurrent order placements, we have implemented a queue-based system that assigns order numbers to incoming orders in a sequential manner. By using queues, we ensure that each order is processed one by one, eliminating any potential race conditions that may arise when multiple people place orders simultaneously. This was done with the help of [Bull](https://www.npmjs.com/package/bull) package and **Redis**.


#### Q- What service are we using to host the REST API?

**A-** For hosting the REST API, we have opted for Amazon Web Services (AWS) EC2 instances, leveraging their reliable infrastructure to ensure seamless deployment and scalability of the application.

#### Q- How does the authentication process work?
**A-** We are the **JSON Web Tokens (JWT)** to log in a user into the application or the Website. The token is stored securely in the browser or the app and expires after 30 days.

#### Q- How is a user email verified at the time of Signing Up?
**A-** To verify user emails during Sign Up, the project utilizes the Gmail API or Google OAuth2 for sending email verification messages. When a user registers using their email address, the system integrates with the Gmail API or leverages Google OAuth2 to send a verification email to the provided address.

#### Q- What is the need of using three different databases?
**A-** We are using the different databases for the following use cases:
* **MongoDB-** MongoDB serves as the central data repository for the food ordering project, storing information about outlets, products, orders, users, and owners. It enables efficient data retrieval, storage, and management, ensuring smooth operations.

* **Redis-** Redis is currently being used for two main tasks:
    * **Order queue:** The entire order queue is stored in Redis.
    * **Mail queue:** The version of Gmail API we are using to send OTP mails to users has a rate limiter of sending not more than 100 mails/second. To ensure this condition never arises, we are using a mail queue with concurrency set to 80, which means at a time only 80 verification emails can be sent.
    * In the future we are planning to implement **caching** using Redis to reduce API response times even further.

* **Firebase-** We are using Firebase to enable real-time communication between the **server**, Apps, and the website. Real-time communication is mainly required for **Order handling**. At the various stages of the order handling process, real-time notifications are sent to the apps and the website to update their UI accordingly.

#### Q- Which payment gateway are we using and how do refunds work?
**A-** We are currently using the sandbox version of the [**Cashfree**](https://www.cashfree.com/) Payment gateway. The refunds are handled in the following ways:

* If an order is rejected by the outlet, the user is given the option to claim a **coupon** for the same order amount which can be used immediately at the same outlet again (coupon be used only at the outlet from where the order was rejected) only once.

* Or ask for a **refund** which is credited back to the original payment method of the user in T+7 days.

#### Q- How does the Analytics Dashboard work?
**A-** We are using **MongoDB's Aggregation Pipeline** queries to calculate the revenues and the product comparison statistics.

## Launching

Our app is scheduled to be launched at Lovely Professional University (LPU), where it will be utilized by the Nescafe Food outlet. This real-world deployment will enable us to thoroughly test the app and gather valuable feedback, facilitating further enhancements and scalability for future expansion to additional outlets.


## License

[MIT License](https://github.com/mridul549/FlavR-Backend/blob/9ba7614c00254c560dd75abfaaf9cc2dae21c5a0/LICENSE)

