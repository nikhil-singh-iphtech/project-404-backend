
const register={
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "_id": "6a28efd207f3e5afec3e1813",
      "name": "nikhil",
      "email": "himanshurajpoot9918@gmail.com",
      "profilePicture": null,
      "authProvider": "email",
      "isEmailVerified": false
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTI4ZWZkMjA3ZjNlNWFmZWMzZTE4MTMiLCJpYXQiOjE3ODEwNjc3MzAsImV4cCI6MTc4MTA2ODYzMH0.zHx_56N1qXsZotkUZUkb3ZTMYVUPWvacRt2XS2sOg9o",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTI4ZWZkMjA3ZjNlNWFmZWMzZTE4MTMiLCJpYXQiOjE3ODEwNjc3MzAsImV4cCI6MTc4MTY3MjUzMH0.rPV6xX400W0vzliO40Rr6F97AfgW3-6QuXgbyDCPCFQ"
  }
}

const login={
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "6a28efd207f3e5afec3e1813",
      "name": "nikhil",
      "email": "himanshurajpoot9918@gmail.com",
      "profilePicture": null,
      "authProvider": "email",
      "isEmailVerified": false
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTI4ZWZkMjA3ZjNlNWFmZWMzZTE4MTMiLCJpYXQiOjE3ODEwNzA0MzAsImV4cCI6MTc4MTA3MTMzMH0.7X7FBAkSRLnNtCs0vVnMcoabKjLBX7_OqsQ8nOGnlxY",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTI4ZWZkMjA3ZjNlNWFmZWMzZTE4MTMiLCJpYXQiOjE3ODEwNzA0MzAsImV4cCI6MTc4MTY3NTIzMH0.4QJN72PabRhcyx-TC0MdWFvFhN6ZuDHn7LcQl8l5R5E"
  }
}


const workspace={
  "success": true,
  "message": "Workspace created successfully",
  "data": {
    "workspace": {
      "name": "Acme Corp",
      "slug": "acme-corp",
      "description": "main company workspace",
      "logo": null,
      "owner": "6a28efd207f3e5afec3e1813",
      "isInviteOnly": true,
      "_id": "6a28f11fc2aa3adb7c6a5651",
      "createdAt": "2026-06-10T05:07:43.187Z",
      "updatedAt": "2026-06-10T05:07:43.187Z",
      "__v": 0
    }
  }
}


const workspacesList={
  "success": true,
  "message": "Workspaces fetched successfully",
  "data": {
    "workspaces": [
      {
        "_id": "6a28f3c54505313cd00a3030",
        "name": "Acme Corp",
        "slug": "acme-corp-4",
        "description": null,
        "logo": null,
        "owner": {
          "_id": "6a28efd207f3e5afec3e1813",
          "name": "nikhil",
          "email": "himanshurajpoot9918@gmail.com"
        },
        "role": "OWNER",
        "joinedAt": "2026-06-10T05:19:01.714Z"
      },
      {
        "_id": "6a28f23a4505313cd00a302e",
        "name": "Acme Corp",
        "slug": "acme-corp-3",
        "description": "main company workspace",
        "logo": null,
        "owner": {
          "_id": "6a28efd207f3e5afec3e1813",
          "name": "nikhil",
          "email": "himanshurajpoot9918@gmail.com"
        },
        "role": "OWNER",
        "joinedAt": "2026-06-10T05:12:26.642Z"
      },
      {
        "_id": "6a28f1f14505313cd00a302c",
        "name": "Acme Corp",
        "slug": "acme-corp-2",
        "description": "main company workspace",
        "logo": null,
        "owner": {
          "_id": "6a28efd207f3e5afec3e1813",
          "name": "nikhil",
          "email": "himanshurajpoot9918@gmail.com"
        },
        "role": "OWNER",
        "joinedAt": "2026-06-10T05:11:13.516Z"
      },
      {
        "_id": "6a28f11fc2aa3adb7c6a5651",
        "name": "Acme Corp",
        "slug": "acme-corp",
        "description": "main company workspace",
        "logo": null,
        "owner": {
          "_id": "6a28efd207f3e5afec3e1813",
          "name": "nikhil",
          "email": "himanshurajpoot9918@gmail.com"
        },
        "role": "OWNER",
        "joinedAt": "2026-06-10T05:07:43.246Z"
      }
    ]
  }
}

const url=http://localhost:3000/invitations/accept?token=1eea705eef3bd67eca71f6c87a6f69b7e979e85bb57a1cfd0427ccf355a1c2a0

const INVITE_TOKEN="1eea705eef3bd67eca71f6c87a6f69b7e979e85bb57a1cfd0427ccf355a1c2a0"
const INVITATION_ID="6a2903ab1994d79c9214c300"