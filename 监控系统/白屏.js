DEFAULT_IGNORE_TAGS = ["SCRIPT", "STYLE", "META", "HEAD"];
ERROR_RELATED_TYPE = ["js_error", "http", "resource_error"];
DEFAULT_THRESHOLD = 1.5;
var measure = function (element, depth, sum, threshold, ignoreTags) {
  if (depth === void 0) {
    depth = 0;
  }
  if (sum === void 0) {
    sum = 0;
  }
  if (threshold === void 0) {
    threshold = DEFAULT_THRESHOLD;
  }
  if (ignoreTags === void 0) {
    ignoreTags = DEFAULT_IGNORE_TAGS;
  }
  if (
    !element ||
    ignoreTags.indexOf(element.tagName) > -1 ||
    sum >= threshold ||
    depth > 4
  ) {
    return sum;
  }
  var score = (function () {
    if (!depth) return 0;
    var _a = element.getBoundingClientRect(),
      top = _a.top,
      height = _a.height;
    console.log("被打分元素", element);
    console.log("top", top, "innerHeight", innerHeight, "height", height);
    if (!(top > innerHeight || height <= 0)) {
      console.log("得分", 1 / Math.pow(2, depth - 1));
    }
    console.log("--------");
    return top > innerHeight || height <= 0 ? 0 : 1 / Math.pow(2, depth - 1);
  })();
  return [].reduceRight.call(
    element.children,
    function (all, child) {
      return measure(child, depth + 1, all, threshold, ignoreTags);
    },
    sum + score
  );
};
root = document.querySelector("body");
console.log("总分", measure(root));

// export const measure = (element, depth = 0, sum = 0, threshold = 1.5) => {
//   if (!element || sum >= threshold) {
//     return sum;
//   }

//   const score = (() => {
//     // skip the first level element
//     if (!depth) return 0;
//     const { top, height } = getBounding(element);
//     return top > innerHeight || height <= 0 ? 0 : 1 / Math.pow(2, depth - 1);
//   })();

//   return [].reduceRight.call(
//     element.children,
//     (all, child) => measure(child, depth + 1, all, threshold),
//     sum + score
//   );
// };
