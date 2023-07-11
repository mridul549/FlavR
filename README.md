
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

This section decribes in detail the working of the User app, the owner app and the Website (All three of these are still in developement phase, so there might be some bugs).

## The User app

## The Owner app

## The Website
The website developed as part of the food ordering project serves as a comprehensive outlet management system for owners. Built using **React.js**, the website offers a user-friendly interface and a range of features that facilitate efficient management of the outlet's operations.

#### Repo
Check repo [here](https://github.com/mridul549/ownerweb)

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
    * Add an outlet

    * Get all outlets

    * Update an outlet

    * Delete an outlet
    
* Handling of incoming orders
    * Contains three sections
        * **Pending Confirmation:** Once a new order arrives, it will come in this section, the owner would first have to accept an order or reject it selecting the proper reason.
        * **Active Orders:** Once an order is accepted, it is brought to this section along with the assignment of the order number. 
        * **Ready Orders:** This section contains orders that are marked as prepared and ready for pickup.
    * The entire order handling process works in real time with notifications being sent to the user at each stage automatically.

* Analytics Dashboard
    * The analytics section provides an owner with **three** important pieces of information.
        * **Revenue Generated:** This lets the owner know how much revenue was generated by an outlet on a given date, month, or year.
          <img width="523" alt="Screenshot 2023-07-11 at 11 15 08 PM" src="https://github.com/mridul549/FlavR-Backend/assets/94969636/f6e00a8c-1037-4c74-9e74-c96c41f36180">

        * **Outlets comparison:** This lets the owner compare multiple outlets based on revenue generated on a given day, month, or year.
          <img width="527" alt="Screenshot 2023-07-11 at 11 15 40 PM" src="https://github.com/mridul549/FlavR-Backend/assets/94969636/74a59339-a073-49b1-b075-1ba1512cfe86">

        * **Products comparison:** This lets the owner compare the performance of the various products of the outlet based on the quantity ordered on a given day, month, or year.
          <img width="1048" alt="Screenshot 2023-07-11 at 11 15 56 PM" src="https://github.com/mridul549/FlavR-Backend/assets/94969636/4cde9aca-33fc-40b6-8c91-1dea0abae86d">

