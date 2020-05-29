/* JQuery
-------------------------------*/

(function main($) {
  "use strict";

  const $output = $("#output");
  const $input = $("input");

  const updateOutput = function() {
    $output.text($input.val());
  };

  $input.on("keyup", updateOutput);
})(jQuery);

$(".marquee").marquee({
  direction: "up"
});
