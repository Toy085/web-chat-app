![Hackatime Badge](https://hackatime-badge.hackclub.com/U09M6CNTTML/web-chat-app)
# web-chat-app

A chat app built with svelte and socket.io!

### Screenshots:

<img width="1470" height="923" alt="Homepage" src="https://github.com/user-attachments/assets/2ab57c85-a9ec-436d-a799-05706b71f1b9" />
<img width="1470" height="923" alt="Chat UI" src="https://github.com/user-attachments/assets/cf546cfd-30c3-4d68-8fed-0de2df272be0" />

## Developing

Install dependencies with `npm install` (or `pnpm install` or `yarn`), 

Start development server with client and server:

```sh
npm run dev
```

Or only client:

```sh
cd app
npm run dev
```

Or only server:

```sh
cd server
node index.ts
```

## Building Web client

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
