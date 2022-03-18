////////////////////////////////////////////
// Import Dependencies
////////////////////////////////////////////
const express = require('express')
const Nft = require('../models/nft')
const Moralis = require("moralis/node");
const { timer } = require("rxjs");

// Moralis Server Url and Application ID
const serverUrl = "https://1sa1hg8dmqdd.usemoralis.com:2053/server" // link to server url in .env
const appId = "4n89IUpSAyBXWWPJtQbmcNsdA8FHIfFkIyzphIVq" // link to application id in .env

// Start Moralis
Moralis.start({ serverUrl, appId})

// Function to convert image url from ipfs:// to https://gateway.ipfs.io so we can render the image
const resolveLink = (url) => {
    if (!url || !url.includes("ipfs://")) return url;
    return url.replace("ipfs://", "https://gateway.ipfs.io/ipfs/");
  };

// Collection address and name for BoredApeYachtClub NFT collection
const collectionAddress = "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D"; // NFT Collection Address
const collectionName = "BoredApeYachtClub"; // NFT Collectioon Name

// Function to generate the Scarcity Score for each individual NFT in a collection
async function generateScarcity() {
    const NFTs = await Moralis.Web3API.token.getAllTokenIds({
      address: collectionAddress,
    });
    
    const totalNum = NFTs.total; // total number of NFTs in the collection
    const pageSize = NFTs.page_size; // number of NFTs per API call (500)
    console.log(totalNum);
    console.log(pageSize);
    let allNFTs = NFTs.result;
    
    // Timer used to allow time in between each API call
    const timer = (ms) => new Promise((res) => setTimeout(res, ms));
  
    // For loop to loop over all NFTs and grab 500 per API call until all NFTs in the collection are in NFTs.result
    for (let i = pageSize; i < totalNum; i = i + pageSize) {
      const NFTs = await Moralis.Web3API.token.getAllTokenIds({
        address: collectionAddress,
        offset: i,
      });
      allNFTs = allNFTs.concat(NFTs.result);
      await timer(6000); // specifies 6 seconds in between API calls to not overwhelm the API with too many consecutive calls
    }
  
    // Gets metadata from each NFT and stored is in a variable
    let metadata = allNFTs.map((e) => JSON.parse(e.metadata).attributes);
  
    // Keeps track of number of traits reported for each 
    let tally = { TraitCount: {} };
  
    // For loop to loop over the metadata
    for (let j = 0; j < metadata.length; j++) {
      let nftTraits = metadata[j].map((e) => e.trait_type);
      let nftValues = metadata[j].map((e) => e.value);
      let numOfTraits = nftTraits.length;
        
      // Increment tally trait count for each trait that exists
      if (tally.TraitCount[numOfTraits]) {
        tally.TraitCount[numOfTraits]++;
      } else {
        tally.TraitCount[numOfTraits] = 1;
      }
      
      // Loop over each NFT trait
      for (let i = 0; i < nftTraits.length; i++) {
        let current = nftTraits[i];

        // If/else used to count the number of times each trait exists
        if (tally[current]) {
          tally[current].occurences++;
        } else {
          tally[current] = { occurences: 1 };
        }

        // If/else to count the number of times each trait value occurs
        let currentValue = nftValues[i];
        if (tally[current][currentValue]) {
          tally[current][currentValue]++;
        } else {
          tally[current][currentValue] = 1;
        }
      }
    }
    
    
    const collectionAttributes = Object.keys(tally); // get all the keys in the tally object and assign them to a variable
    let nftArr = []; // initialize an empty array to store the NFTs

    // Looping over all the metadata to get the current NFT metadata
    for (let j = 0; j < metadata.length; j++) {
      let current = metadata[j];
      let totalScarcity = 0; // initialized scarcity score to 0
      // Looping over the current NFT metadata to access the trait_type and value
      for (let i = 0; i < current.length; i++) {
        let scarcityScore =
          1 / (tally[current[i].trait_type][current[i].value] / totalNum); // scarcity calculated as: 1 / (# of NFTs with same trait and value / total # of NFTs in the collection)
        current[i].scarcityScore = scarcityScore;
        totalScarcity += scarcityScore;
      }
  
      // Push an object into the current NFT metadata containing trait_type, value, and scarcityScore
      let scarcityScoreNumTraits =
        8 * (1 / (tally.TraitCount[Object.keys(current).length] / totalNum));
      current.push({
        trait_type: "TraitCount",
        value: Object.keys(current).length,
        scarcityScore: scarcityScoreNumTraits,
      });
      totalScarcity += scarcityScoreNumTraits; // // Add the scarcityScoreNumTraits to the totalScarcity score
  
      // If the current NFT metadata length is less than the collection metadata length, we are missing that trait
      if (current.length < collectionAttributes.length) {
        let nftAttributes = current.map((e) => e.trait_type); // map to check which trait_types are present
        let absent = collectionAttributes.filter( // filter functions to check which trait_types are missing
          (e) => !nftAttributes.includes(e)
        );
        
        // Calculate scarcity score for attributes that are missing
        absent.forEach((type) => {
          let scarcityScoreNull =
            1 / ((totalNum - tally[type].occurences) / totalNum); // scarcityScoreNull = 1 / ((total # of NFTs in the collection - # NFTs missing property) / total # of NFTs in the collection)
          current.push({ // push to update scarcity score object in NFT metadata
            trait_type: type,
            value: null,
            scarcityScore: scarcityScoreNull,
          });
          totalScarcity += scarcityScoreNull; // Add the scarcityScoreNull to the totalScarcity score
        });
      }
      
      // onvert image url from ipfs:// to https://gateway.ipfs.io so we can render the image
      if (allNFTs[j].metadata) {
        allNFTs[j].metadata = JSON.parse(allNFTs[j].metadata);
        allNFTs[j].image = resolveLink(allNFTs[j].metadata.image);
      } else if (allNFTs[j].token_uri) {
        try {
          await fetch(allNFTs[j].token_uri)
            .then((response) => response.json())
            .then((data) => {
              allNFTs[j].image = resolveLink(data.image);
            });
        } catch (error) {
          console.log(error);
        }
      }
    
      // Pushing object with attributes, rarity score, token_id, and image into nftArr array
      nftArr.push({
        Attributes: current,
        Scarcity: totalScarcity,
        token_id: allNFTs[j].token_id,
        image: allNFTs[j].image,
      });
    }
    
    // Ranking NFTs by most scarse to lease scarse
    nftArr.sort((a, b) => b.Scarcity - a.Scarcity);
    
    // Looping through the nftArr to add a rank number to each array element
    for (let i = 0; i < nftArr.length; i++) {
      nftArr[i].Rank = i + 1;
      const newClass = Moralis.Object.extend(collectionName); // create new Moralis class for collection name
      const newObject = new newClass(); // add new object into the Moralis class
    
      newObject.set("attributes", nftArr[i].Attributes);
      newObject.set("scarcity", nftArr[i].Scarcity);
      newObject.set("tokenId", nftArr[i].token_id);
      newObject.set("rank", nftArr[i].Rank);
      newObject.set("image", nftArr[i].image);
  
      await newObject.save(); // save the new collectionName object
      console.log(i); // keeps a count of the number of NFTs added to the array
    }
    
    return true
  }

////////////////////////////////////////////
// Create router
////////////////////////////////////////////
const router = express.Router()

////////////////////////////////////////////
// Router Middleware
////////////////////////////////////////////
// create some middleware to protect these routes
// Authorization middleware
router.use((req, res, next) => {
	// checking the loggedin boolean of our session
	if (req.session.loggedIn) {
		// if they're logged in, go to the next thing(thats the controller)
		next()
	} else {
		// if they're not logged in, send them to the login page
		res.redirect('/user/login')
	}
})

////////////////////////////////////////////
// Routes
////////////////////////////////////////////

// index ALL nfts route
router.get('/', (req, res) => {
	// find the nfts
	Nft.find({})
		// then render a template AFTER they're found
		.then((nfts) => {
			const username = req.session.username
			const loggedIn = req.session.loggedIn
			// console.log(nfts)
			res.render('nfts/index', { nfts, username, loggedIn })
		})
		// show an error if there is one
		.catch((error) => {
			console.log(error)
			res.json({ error })
		})
})

// index that shows only the user's nfts
router.get('/mine', (req, res) => {
	// find the nfts
	Nft.find({ owner: req.session.userId })
		// then render a template AFTER they're found
		.then((nfts) => {
			// console.log(nfts)
			const username = req.session.username
			const loggedIn = req.session.loggedIn

			res.render('nfts/index', { nfts, username, loggedIn })
		})
		// show an error if there is one
		.catch((error) => {
			console.log(error)
			res.json({ error })
		})
})

// new route -> GET route that renders our page with the form
router.get('/new', (req, res) => {
	const username = req.session.username
	const loggedIn = req.session.loggedIn
	res.render('nfts/new', { username, loggedIn })
})

// create -> POST route that actually calls the db and makes a new document
router.post('/', (req, res) => {
	// check if the readyToEat property should be true or false
	// we can check AND set this property in one line of code
	// first part sets the property name
	// second is a ternary to set the value
	req.body.readyToEat = req.body.readyToEat === 'on' ? true : false
	// console.log('this is the nft to create', req.body)
	// now we're ready for mongoose to do its thing
	// now that we have user specific nfts, we'll add the username to the nft created
	// req.body.username = req.session.username
	// instead of a username, we're now using a reference
	// and since we've stored the id of the user in the session object, we can use it to set the owner property of the nft upon creation.
	req.body.owner = req.session.userId
	Nft.create(req.body)
		.then((nft) => {
			console.log('this was returned from create', nft)
			res.redirect('/nfts')
		})
		.catch((err) => {
			console.log(err)
			res.json({ err })
		})
})

// edit route -> GET that takes us to the edit form view
router.get('/:id/edit', (req, res) => {
	// we need to get the id
	const nftId = req.params.id
	// find the nft
	Nft.findById(nftId)
		// -->render if there is a nft
		.then((nft) => {
			console.log('edit froot', nft)
			const username = req.session.username
			const loggedIn = req.session.loggedIn
			res.render('nfts/edit', { nft, username, loggedIn })
		})
		// -->error if no nft
		.catch((err) => {
			console.log(err)
			res.json(err)
		})
})

// update route -> sends a put request to our database
router.put('/:id', (req, res) => {
	// get the id
	const nftId = req.params.id
	// check and assign the readyToEat property with the correct value
	req.body.readyToEat = req.body.readyToEat === 'on' ? true : false
	// tell mongoose to update the nft
	Nft.findByIdAndUpdate(nftId, req.body, { new: true })
		// if successful -> redirect to the nft page
		.then((nft) => {
			console.log('the updated nft', nft)

			res.redirect(`/nfts/${nft.id}`)
		})
		// if an error, display that
		.catch((error) => res.json(error))
})

// show route
router.get('/:id', (req, res) => {
	// first, we need to get the id
	const nftId = req.params.id
	// then we can find a nft by its id
	Nft.findById(nftId)
		.populate('comments.author')
		// once found, we can render a view with the data
		.then((nft) => {
			console.log('the nft we got\n', nft)
			const username = req.session.username
			const loggedIn = req.session.loggedIn
			const userId = req.session.userId
			res.render('nfts/show', { nft, username, loggedIn, userId })
		})
		// if there is an error, show that instead
		.catch((err) => {
			console.log(err)
			res.json({ err })
		})
})

// delete route
router.delete('/:id', (req, res) => {
	// get the nft id
	const nftId = req.params.id
	// delete the nft
	Nft.findByIdAndRemove(nftId)
		.then((nft) => {
			console.log('this is the response from FBID', nft)
			res.redirect('/nfts')
		})
		.catch((error) => {
			console.log(error)
			res.json({ error })
		})
})
////////////////////////////////////////////
// Export the Router
////////////////////////////////////////////
module.exports = router