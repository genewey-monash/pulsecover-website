/* Line icons for partner perks, vouchers and events (same set as the Ionicons used in the app). */
(function () {
  var P = {
    medkit: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M12 10v7M8.5 13.5h7"/>',
    cafe: '<path d="M4 9h12v5a5 5 0 01-5 5H9a5 5 0 01-5-5zM16 10h2a2 2 0 010 4h-2M7 3v2M11 3v2"/>',
    cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.5 12h11l2-8H6"/>',
    barbell: '<path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/>',
    watch: '<rect x="7" y="6" width="10" height="12" rx="3"/><path d="M9 6l1-3h4l1 3M9 18l1 3h4l1-3M12 10v2l1.5 1"/>',
    pricetag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.2"/>',
    flag: '<path d="M5 21V4M5 4h12l-2 4 2 4H5"/>',
    footsteps: '<path d="M8 4c1.5 0 2.5 1.5 2.5 3.5S9.5 11 8 11 5.5 9.5 5.5 7.5 6.5 4 8 4zM6 14h4v2a2 2 0 01-4 0zM16 9c1.5 0 2.5 1.5 2.5 3.5S17.5 16 16 16s-2.5-1.5-2.5-3.5S14.5 9 16 9zM14 19h4v1a2 2 0 01-4 0z"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    steps: '<path d="M8 4c1.5 0 2.500 1.500 2.500 3.500S9.500 11 8 11 5.500 9.500 5.500 7.500 6.500 4 8 4zM6 14h4v2a2 2 0 01-4 0zM16 9c1.500 0 2.500 1.500 2.500 3.500S17.500 16 16 16s-2.500-1.500-2.500-3.500S14.500 9 16 9zM14 19h4v1a2 2 0 01-4 0z"/>',
    bolt: '<path d="M13 2L5 14h6l-1 8 8-12h-6z"/>',
    moon: '<path d="M20 14.500A8 8 0 019.500 4a8 8 0 1010.500 10.500z"/>',
    heart: '<path d="M12 20s-7-4.400-8.700-9A4.700 4.700 0 0112 7a4.700 4.700 0 018.700 4C19 15.600 12 20 12 20z"/>',
    flame: '<path d="M12 3c1 3.500 5 5.500 5 10a5 5 0 01-10 0c0-2 1-3.500 2-4.500 0 2 1 3 2 3 0-3-1-5 1-8.500z"/>',
    plug: '<rect x="7" y="6" width="10" height="12" rx="3"/><path d="M9 6l1-3h4l1 3M9 18l1 3h4l1-3M12 10v2l1.500 1"/>',
    users: '<circle cx="9" cy="8" r="3.500"/><path d="M2.500 20c0-3.500 3-6 6.500-6s6.500 2.500 6.500 6M16 5a3.500 3.500 0 010 7M18 14c2.500.5 4 2.500 4 6"/>',
    star: '<path d="M12 3l2.700 5.800 6.300.8-4.600 4.300 1.200 6.300L12 17l-5.600 3.200 1.200-6.300L3 9.600l6.300-.8z"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>'
  };
  /* tile: rounded square with the icon; locked tiles go grey and get a small lock badge, so the icon always stays recognisable */
  /* plain line icon (badges, streak flame), same drawing style as the partner tiles */
  window.PC_LINE_ICON = function (name, size) {
    var z = size || 22;
    return '<svg viewBox="0 0 24 24" width="' + z + '" height="' + z + '" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || P.star) + '</svg>';
  };
  window.PC_PARTNER_ICON = function (name, size, locked) {
    var s = size || 22;
    return '<span class="pi' + (locked ? ' locked' : '') + '" aria-hidden="true"><svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + (P[name] || P.pricetag) + '</svg>' +
      (locked ? '<i><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' + P.lock + '</svg></i>' : '') + '</span>';
  };
})();
