# Dynamic Configuration Example

This example demonstrates customizing the Finsemble menus and workspaces on a per user basis. In this example, the user configuration is pulled form [_users.json_](users.json), but, in a real application, the user configuration would be pulled from external storage such as a database. 

## Installation

To run this example, check out the recipes/dynamic-configuration-example branch of the Finsemble Seed project. Run `npm install` and then `npm run dev` to start the application. 

## Use

When started, the user is presented with an authentication component that allows them to select from a list of users and log in. Each user has a different configuration of menus, components and workspaces. 