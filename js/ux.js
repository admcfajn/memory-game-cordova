var
  difficulty = document.getElementById('difficulty'),
  // ux_cells_wide = document.getElementById('cells_wide'),
  // ux_cells_high = document.getElementById('cells_high'),
  // ux_number_variants = document.getElementById('number_variants'),
  // ux_number_each_variant = document.getElementById('number_each_variant');
  /* array of all inputs to be populated */
  dropElements = [difficulty];
  // dropElements = [ux_cells_wide,ux_cells_high,ux_number_variants,ux_number_each_variant];
  gameParams = [];
/**/
for(var i = 2; i < 16; i++ ){
  gameParams.push(i.toString());
}

for(var i = 0; i < dropElements.length; i++ ){
  for(var k = 0; k < gameParams.length; k++ ){
    dropElements[i].add( new Option( gameParams[k], [gameParams[k] ] ) );
  }
}
