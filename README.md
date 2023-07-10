
# FlavR

This food ordering project is a comprehensive solution that facilitates a seamless ordering process for users while providing efficient management tools for outlet owners. The project consists of two distinct apps developed using Flutter: a user app and an owner app.

The user app allows customers to conveniently browse and select food items from local food outlets. Once the order is placed, users are seamlessly redirected to a secure payment gateway to complete the transaction. This ensures a smooth and secure payment process. After successful payment, the order details are automatically forwarded to the respective outlet for confirmation.

Upon confirmation by the outlet, an order number is assigned, and users are notified through the app. This eliminates the need for users to physically visit the outlet or repeatedly inquire about the status of their order. Users can simply wait for the notification and then proceed to the food outlet for order collection.

On the other hand, the owner app provides outlet owners with powerful tools to efficiently manage their operations. Owners can view and process incoming orders, keeping track of order details, delivery preferences, and customer information. The app also facilitates seamless communication with users, enabling owners to provide updates or address any concerns regarding the order.

To further enhance outlet management, a dedicated website using React.js has been developed specifically for owners. This website serves as a comprehensive outlet management system, allowing owners to perform CRUD operations on their menu and outlet(s), and monitor the incoming orders. It also provides the owner with various analytics about their outlet, like revenue generated, comparison of outlets, and ordering frequency. The website also provides a user-friendly interface and can be easily accessed from larger screens, making it ideal for use in the outlet's kitchen.

The backend of the project is built using Node.js, Express, MongoDB, Redis, and Firebase. These technologies ensure efficient data management, real-time notifications, and seamless integration between the user app, owner app, and website.

Overall, this project revolutionizes the food ordering experience by providing a convenient and streamlined solution for users while empowering outlet owners with efficient management tools. It enhances customer satisfaction, reduces waiting times, and increases operational efficiency for food outlets.


## Key Features

- User-Friendly Ordering
- Real-time management of orders by the outlet
- Secure Payment Gateway
- Cross-platform functionality
- Various Analytics tools available
- User app, Owner app, and Website work together in sync


## Tech Stack

**Website:** ReactJS, Context API, and Bootstrap.

**User and Owner App:** Flutter, Firebase, and Bloc.

**Server:** NodeJS, Express, MongoDB, Redis, and Firebase.


# Description of the Apps

This section describes in detail the working of the User app, the owner app, and the Website (All three of these are still in the development phase, so there might be some bugs).

### The User app

### The Owner app

### The Website
The website developed as part of the food ordering project is a comprehensive outlet management system for owners. Built using **React.js**, the website offers a user-friendly interface and a range of features that facilitate efficient management of the outlet's operations.

#### Key features 

* **Outlet Menu Management:** The website enables owners to perform CRUD operations on the menu. They can easily add, update, and delete food items, ensuring that the menu is always up to date and reflects the available options.

* **Outlet Information:** Owners can update important information about their outlet, such as contact details, address, working hours

* **Order Tracking:** The website provides a centralized platform for owners to track and manage incoming orders. Owners can view details of each order, including the items ordered, delivery preferences, and customer information.

* **Real-Time Notifications:** The website offers real-time notifications to owners, keeping them informed about new orders.

* **Analytics and Reporting:** The website includes analytics features that provide owners with valuable insights into their business. They can access data on popular menu items, sales performance, and different outlets comparison (the ones they own).

#### Demo

* CRUD operations for the menu
* CRUD operations for the outlet
* Handling of incoming orders
* Analytics Dashboard

