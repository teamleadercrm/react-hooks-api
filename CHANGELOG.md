## Unreleased

### ✨ Added

- Fetch policy: cache-first, cache-and-network and network-only ([ArnaudWeyts](https://github.com/ArnaudWeyts) in [#317](https://github.com/teamleadercrm/react-hooks-api/pull/317))

## [0.1.0-rc13] - 2020-04-13

### 🐛 Fixed

- Fixed an issue with the global queries object which caused a memory leak that would duplicate network requests ([ArnaudWeyts](https://github.com/ArnaudWeyts) in [#314](https://github.com/teamleadercrm/react-hooks-api/pull/314))

## [0.1.0-rc12] - 04-03-2020

### 🐛 Fixed

- Fix a bug when automatically merging side-loaded entities causing problems with unconventional paths ([ArnaudWeyts](https://github.com/ArnaudWeyts) in [#245](https://github.com/teamleadercrm/react-hooks-api/pull/245))

## [0.1.0-rc11] - 2020-01-29

This version is a republish of a version 0.1.0-rc10 because the wrong version was published under that tag.

## [0.1.0-rc10] - 2020-01-29

### 🐛 Fixed

- Fix error when resolving primitive values ([ArnaudWeyts](https://github.com/ArnaudWeyts) in [#207](https://github.com/teamleadercrm/react-hooks-api/pull/207))

## [0.1.0-rc9] - 2020-01-28

### 🐛 Fixed

- Fix error when trying to merge array references that can be `null` ([ArnaudWeyts](https://github.com/ArnaudWeyts) in [#204](https://github.com/teamleadercrm/react-hooks-api/pull/204))

## [0.1.0-rc8] - 2020-01-23

### 🐛 Fixed

- Fix error when trying to merge entity types that were not present in the store ([ArnaudWeyts](https://github.com/ArnaudWeyts) in [#196](https://github.com/teamleadercrm/react-hooks-api/pull/196))

### ♻️ Changed

- [INTERNAL] Replace deprecated tslint with eslint ([ArnaudWeyts](https://github.com/ArnaudWeyts) in [#194](https://github.com/teamleadercrm/react-hooks-api/pull/194))

## [0.1.0-rc7] - 2020-01-13

### ✨Added

- Support `fetchAll` option from `@teamleader/api` ([ArnaudWeyts](https://github.com/ArnaudWeyts) in [#183](https://github.com/teamleadercrm/react-hooks-api/pull/183))

## [0.1.0-rc6] - 2020-01-09

### 🐛 Fixed

- 🐛 Fix fetch call being overwritten when 2 identical queries get registered https://github.com/teamleadercrm/react-hooks-api/pull/180

## [0.1.0-rc5] - 2020-01-07

### 🐛 Fixed

- Typing for the exported queries object

## [0.1.0-rc4] - 2020-01-07

### ✨Added

- Implement global queries object https://github.com/teamleadercrm/react-hooks-api/pull/178

## [0.1.0-rc3] - 2019-12-02

### 🐛 Fixed

- Fixed a bug where we were trying to select ids of a query before it has finished loading https://github.com/teamleadercrm/react-hooks-api/pull/153

## [0.1.0-rc2] - 2019-12-02

### 🐛 Fixed

- Fixed a bug that caused entities to be overwritten instead of enriched

## [0.1.0-rc1] - 2019-11-29

### 💥Breaking changes

- Sideloaded data is now automatically merged into the entity it belongs to. This means the signature of the object returned by useQuery has changed. See below or consult the README for more information.

```ts
type Object = {
 // The entity or list of entities
 // Can also be calculated data (see projectItems.report)
 data: Entity || Array<Entity> || NonEntity;
 // Metadata returned by the request
 meta: any
}

const object: Object = useQuery(query);
```

## [0.0.4] - 2019-07-11

### Other

- Upgraded dependencies

## [0.0.3] - 2019-06-06

### Added

- useQuery now accepts an optional third argument. For now, the only available option is `ignoreCache`. Which is set to false by default.

## [0.0.2] - 2019-05-28

### Fixed

- Overwriting an existing redux context

## [0.0.1] - 2019-05-28

### 🎉 Initial release
