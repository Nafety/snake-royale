function collide(a, b) {
  // Comparaison simple en grille : deux cellules sont identiques si x et y sont égaux
  return a.x === b.x && a.y === b.y;
}

module.exports = { collide };
