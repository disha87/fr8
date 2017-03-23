Fleet Management App 

Live Demo
---------------------------------------------
https://fr8.herokuapp.com/

Login
---------------------------------------------
user: BigHaulDriver/password: 123
user: BigHaul/password: 123
user: HeavyHaulDriver/password: 123
user: HeavyHaul/password: 123
user: John/password: 123

Description
---------------------------------------------
Fleet Management app is built using Node.js, mongodb on the backend and jade, bootstrap on the front end. The app facilitates registration of drivers, carriers and owner operators. Once logged in, they can add loads and view schedule information. Authentication is handled by using Passport.js library. Session management is also handled. Unit tests are written using chai and supertest libraries. On the backend, we have different APIs for registration, adding loads and schedule. There are 2 Collections defined - Account Collection and Load Collection. To find a schedule for a given type of user, say carrier, we go through all his drivers and their loads. Then we look at their trusted owner operators and find their loads that they are carrying for that carrier.  


