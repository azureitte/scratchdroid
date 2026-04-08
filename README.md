# Scratchdroid
An unofficial mobile client for the Scratch website and (in the future) editor.

## Developing
After cloning the repo, run:
```bash
npm install
eas build --platform android --profile development
```
> Note: Make sure you have expo eas-cli installed

Download the development build to your device and run:
```bash
npx expo start --dev-client
```
> Note: The app does not work with Expo Go

> Note: The app has not currently been tested on iOS and will likely not work there.

## Roadmap
This project is currently in development and is incomplete. Here is where it's currently at:

> ✅ Completed | 🟡 In-progress | ✖️ Not started | ❌ Not planned 

- 🟡 Account management
   - ✅ Logging in
   - ❌ Account creation
   - ✖️ Account settings
   - ✖️ Multiple accounts

- ✅ Comment management
   - ✅ View user comments
   - ✅ View project/studio comments
   - ✅ Display links, mentions and emojis in comments
   - ✅ Post comments
   - ✅ Delete/report comments

- 🟡 Project management
   - ✅ View public projects
   - 🟡 View private projects
   - ✅ View project metadata
   - ✅ View project extensions and cloud variable usage
   - 🟡 View project stats
   - ✖️ Edit own projects
   - ✖️ Remix projects
   - ✖️ Create/delete projects

- 🟡 User management
   - ✅ View basic user profile
   - ✅ View user's featured project
   - ✖️ View more user profile info (displayed on scratch.mit.edu/users)
   - ✖️ View Scratch Membership info
   - ✖️ Follow/unfollow users
   - ✖️ Report users
   - ✖️ Edit own profile

- ✖️ Studio management

- 🟡 Messages
    - ✅ View messages
    - ✅ View/clear admin alerts
    - ✅ Mark messages as read
    - ✖️ Filter messages

- 🟡 My Stuff
   - ✅ View my projects
   - ✅ View my studios
   - ✅ View trash
   - 🟡 Filtering
   - ✖️ View stats
   - ✖️ Share/unshare projects
   - ✖️ Delete/restore projects
   - ✖️ Clear trash

- ✖️ Teacher accounts
   - ✖️ Display teacher dashboard on home page for teacher accounts
   - ✖️ Display more info on teacher profile pages
   - ✖️ Allow teachers to edit student profiles
   - ✖️ Display verification pending message for unverified teacher accounts
   - ✖️ View all classes/ended classes
   - ✖️ View class alerts
   - ✖️ View class profile pages
   - ✖️ View own class details
   - ✖️ Create classes
   - ✖️ Edit/end own classes
   - ✖️ Create students/student invite links
   - ✖️ Create class studios

- ✖️ Student accounts
   - ✖️ Display onboarding screen for new student accounts
   - ✖️ Display more info on student profile pages
   - ✖️ Restrict students from creating studios

- ✅ Home page
- ✖️ Explore/search page
- ✖️ Custom project viewer
- ✖️ Project editor
- ❌ Discussion forums