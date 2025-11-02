# AngularBenchmark

Small monorepo with two example of "Angular Counter App" demonstrating different state performance:

- `projects\ngrx` — Angular Counter App with NgRx state manager
- `projects\ngss` — Angular Counter App with NgSimpleState state manager

## Quick start

1 Install dependencies

```shell
npm install
```

2 Run benchmark:

```shell
npm run benchmark:prod
```

3 Output

```shell
NgRx: 2055.70 ms
NgSimpleState: 2002.80 ms
NgSimpleState faster than 52.90 ms (2.6%)
NgSimpleState is 1.03× faster
```
