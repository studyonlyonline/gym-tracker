# Deployment Plan for Gym Tracker PWA

To use the Gym Tracker PWA completely independently of your laptop, we need to host the static files (`index.html`, JavaScript, CSS, and SQLite WASM files) on a web server. 

Because we built this as a **100% Client-Side application (PWA)** with a local SQLite database, we do **not** need a backend server (like Node.js or Java Spring) or a cloud database. We only need **Static Hosting**.

Here are the two easiest and completely free options. **We recommend Option A.**

## Option A: Vercel (Recommended - Easiest & Fastest)
Vercel is a platform optimized for frontend frameworks like our React/Vite app.

### The Plan:
1. **Push Code to GitHub**: We initialize a Git repository in `/Users/sarthak/personal/projects/gym-track/gym-tracker` and push it to a private or public GitHub repository.
2. **Link Vercel to GitHub**: You sign in to Vercel with your GitHub account.
3. **Import Project**: You select your `gym-tracker` repository in Vercel.
4. **Deploy**: Vercel automatically detects it's a Vite project, runs `npm run build`, and provides you with a free, secure HTTPS URL (e.g., `gym-tracker-sarthak.vercel.app`).
5. **Continuous Deployment**: Any future code changes we make on your laptop, we just `git push`, and Vercel automatically updates the live site.
6. **Mobile Access**: You simply open that `vercel.app` URL on your Android phone once, hit "Add to Home Screen", and it becomes a permanent, offline-capable app on your phone.

### Why Vercel?
It automatically handles the necessary COOP/COEP headers required by OPFS (the fast file system our SQLite database uses), via a simple `vercel.json` config file that we will add.

## Option B: Local Network Hosting (No Cloud Required)
If you do **not** want to put your code on GitHub or use any cloud service, you can host it directly from your laptop to your phone *over your home WiFi*.

### The Plan:
1. **Run Dev Server with Network Access**: On your laptop, we run `npm run dev -- --host`.
2. **Find Laptop IP**: We find your laptop's local IP address (e.g., `192.168.1.100`).
3. **Access on Phone**: You connect your phone to the same WiFi, and navigate to `http://192.168.1.100:5173`.
4. **Add to Home Screen**: You install the PWA to your phone.
5. **Offline Capability**: Once installed, the app works entirely offline. 

### Why not Option B?
- The first time you load the app, your laptop *must* be awake and on the same WiFi network.
- Updates are manual: To get new features, you must turn on your laptop server again and refresh the app on your phone.
- It only works over HTTP (unless we set up complex local SSL certificates). PWAs heavily prefer HTTPS to unlock all features.

## Critical Technical Requirement (OPFS Headers)
Our app uses OPFS (Origin Private File System) to make the SQLite database blazing fast. For security reasons, browsers strictly require two headers to be sent by the server hosting the app:
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

If we go with Option A (Vercel), we will create a `vercel.json` file to explicitly set these headers.

---
**How would you like to proceed? We can begin Option A by pushing the code to GitHub.**
