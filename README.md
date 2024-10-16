# PunchFit: Fitness Tracking and Coaching Platform
## Website: https://www.good-msg.xyz/

Welcome to PunchFit, a comprehensive fitness tracking and coaching platform designed to enhance your workout experience. This README provides an overview of the project, its features, and the technical stack used to build it.

## Table of Contents

- [Features](#features)
- [Technical Stack](#technical-stack)
- [License](#license)

## Features

### Punch In Feature
- **Workout Tracking**: Seamlessly track your workouts with detailed records of repetitions, sets, and weights.
- **Media Support**: Upload videos and personal notes to document your workout sessions.


https://github.com/user-attachments/assets/9d6b175d-eb11-431c-ad7d-34fa939ac6ab


### Online Coaches
- **Expert Guidance**: Connect with expert online coaches for personalized advice.
- **Real-Time Interaction**: Share workout content and interact with fitness experts in real-time.


https://github.com/user-attachments/assets/3a1f4989-3542-472e-9d51-d33d09369cce


### Personalized Routines
- **Custom Workouts**: Build personalized exercise routines categorized by body parts.
- **Goal-Oriented Training**: Customize exercise combinations to suit individual fitness goals.


https://github.com/user-attachments/assets/669fcf43-176e-414d-9d65-07c27abdba3c


## Technical Stack
![structure](https://github.com/user-attachments/assets/e5f4ff89-6b77-48c2-a5e6-91f980811a9d)
### Backend

- **Node.js & Express**: The server is built using Node.js and Express, providing a robust and scalable backend framework for handling HTTP requests and routing.
- [**Socket.IO**](http://socket.io/): Enables real-time communication between clients and the server, facilitating live interactions with coaches and instant updates.
- **Sequelize**: An ORM (Object-Relational Mapping) tool used for managing database interactions, providing a structured way to interact with a MySQL database.
- **MySQL**: A relational database management system that can be used for storing structured data, offering flexibility in database choice.
- **Redis**: Used for caching and managing real-time data efficiently, improving performance and reducing database load.

### Infrastructure

- **Docker**: Utilized for containerizing the application, ensuring consistent environments across development, testing, and production.
- **AWS EC2**: Provides scalable compute capacity in the cloud, hosting the application servers.
- **AWS RDS**: A managed relational database service that simplifies database setup, operation, and scaling, used for hosting databases.
- **AWS S3**: Used for storing and retrieving media files, ensuring for file storage.
- **AWS CloudFront**: A content delivery network (CDN) that speeds up the distribution of static and dynamic web content, improving load times for users globally.
- **AWS LoadBalancer**: Distributes incoming application traffic across multiple EC2 instances, to ensure high availability and reliability.

### Security

- **SSL/TLS**: Ensures secure data transmission between clients and the server by encrypting the data, protecting against eavesdropping and man-in-the-middle attacks.
- **Nginx**: Acts as a reverse proxy, handling incoming HTTP requests and distributing them to the appropriate backend services.
### Frontend
- **HTML/CSS/JavaScript**: The frontend is built using standard web technologies, with Bootstrap for responsive design.
- **FullCalendar**: Integrated for scheduling and calendar functionalities.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
