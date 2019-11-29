# 🎣 @teamleader/react-hooks-api

React hooks for the Teamleader API

## Installation

```sh
yarn add @teamleader/react-hooks-api
```

or

```sh
npm install --save @teamleader/react-hooks-api
```

## Getting started

#### Wrap your root inside the `Provider` component and provide an initialized [@teamleader/api](https://github.com/teamleadercrm/sdk-js) config.

```jsx
import React from 'react';
import { Provider } from '@teamleader/react-hooks-api';
import { API as initializeAPI } from '@teamleader/api';

import App from '../App';

const API = initializeAPI({...})

const Root = () => {
  return (
    <Provider api={API}>
      <App />
    </Provider>
  );
}

export default Root;
```

#### You can now start using `useQuery` in your components to fetch data.

```jsx
import React from 'react';
import { useQuery } from '@teamleader/react-hooks-api';

const QUERY = () => ({
  domain: 'projects',
  action: 'list',
});

const Component = () => {
  const { loading, error, data } = useQuery(QUERY);

  if (loading || !data) {
    return 'Loading...';
  }

  if (error) {
    return 'Error';
  }

  if (data) {
    return data;
  }

  // default
  return null;
};

export default Root;
```

## API

### `useQuery`

Signature: `(query: Query, variables: Variables, options: Options) => QueryValues`

[Query](#query)

[Variables](#variables)

[QueryValues](#queryvalues)

[Options](#options)

### `Query`

A function that returns an object. This function can be defined with variables when you need to update it dynamically.

### `Variables`

The variables to be passed to the [Query](#query). When updated, it will re-run the query.

### `QueryValues`

```ts
loading: boolean;
error?: Error;
data?: Entity | Array<Entity> | Record<string, any>
meta?: Record<string, any>
```

### `Options`

```js
{
  ignoreCache: boolean; // default: false
}
```
