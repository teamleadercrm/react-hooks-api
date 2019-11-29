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
