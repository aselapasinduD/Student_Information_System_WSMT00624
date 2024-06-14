# Project - WSMT00624
_Student Management System - Network Marketing Tool_

## Admin Panel with Server
_This folder containe Admin panel and the server_



### Look Inside the Folder
### Folder Structure
```
──admin_panel_with_server <──────[1]
    ├───admin
    ├───admin_panel <─────[2]
    │   ├───build
    │   │   └───static
    │   │       ├───css
    │   │       ├───js
    │   │       └───media
    │   ├───public
    │   └───src
    ├───bin
    ├───controllers
    └───routes
```
1. Admin Panel with Server Folder(admin_panel_with_server) - Back-end(Server)
    * This is the server we build crud functions and create APIs
    * We use Express JS with Node js to create this server.

    Run this code to start the development server.
    ```bash
        npm run watch
    ```

2. Admin Panel Folder(admin_panel) - Front-End
    * this folder contain the front-end of the admin panel
    * We use reactJS as a framework.

    Run this code to start the development server.
    ```bash
        npm start
    ```
    Run this code to build the static website
    ```bash
        npm build
    ```
