# web-chat-app

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