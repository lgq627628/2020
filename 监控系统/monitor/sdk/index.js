import perf from './perf';
import errCatch from './errrCatch';

console.log('222222');
perf.init();
errCatch.init(() => console.log('66666'))
