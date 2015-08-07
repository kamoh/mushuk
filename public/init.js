var cid     = '9896695e978359ad6e39e1b98f22abb4',
	ready   = false,
	track_url,
	currentSound,
	latestSearchResults = [],
	queue = [],
	isMuted = false;

var noNames = ["goober","monkeybat","moosejamms","grumpkin","derf-pooper","roosta","sounddrooper","tacobreath","lolwut","uncle jemima","front-door farter","carseat","air conditioner","lint roller","butterscotch krumpet","tuba repairman","pocket salesman","car door inspector","used gum aficionado","k-pop fanatic","beer ombudsman","big bird impersonator","graffiti stain","wisdom tooth","ignorance tooth","pocket harmonica", "dumb butt"],
    defaultName = noNames[Math.floor(Math.random() * noNames.length)] + Math.floor(Math.random(1,9999)*1000);

SC.initialize({
	client_id: cid
});

soundManager.setup({
    flashVersion: 9, // optional: shiny features (default = 8)
    preferFlash: false,
    onready: function() {
        ready       = true; //I'm assuming soundManager just has a ready property. Too lazy.
        track_url   = 'https://soundcloud.com/hadouken/hadouken-bliss-out-1';
    }
});