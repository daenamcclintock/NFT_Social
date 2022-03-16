// Require Moralis API
const Moralis = require("moralis/node");
const { timer } = require("rxjs");

// Moralis Server Url and Application ID
const serverUrl = "https://1sa1hg8dmqdd.usemoralis.com:2053/server"
const appId = "4n89IUpSAyBXWWPJtQbmcNsdA8FHIfFkIyzphIVq"

// Start Moralis
Moralis.start({ serverUrl, appId})

// Function to make sure Url includes "ipfs://"
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
  
      nftArr.push({
        Attributes: current,
        Scarcity: totalScarcity,
        token_id: allNFTs[j].token_id,
        image: allNFTs[j].image,
      });
    }
  
    nftArr.sort((a, b) => b.Scarcity - a.Scarcity);
  
    for (let i = 0; i < nftArr.length; i++) {
      nftArr[i].Rank = i + 1;
      const newClass = Moralis.Object.extend(collectionName);
      const newObject = new newClass();
  
      newObject.set("attributes", nftArr[i].Attributes);
      newObject.set("scarcity", nftArr[i].Scarcity);
      newObject.set("tokenId", nftArr[i].token_id);
      newObject.set("rank", nftArr[i].Rank);
      newObject.set("image", nftArr[i].image);
  
      await newObject.save();
      console.log(i);
    }
    
    return true
  }
  
  generateScarcity()
  .then( ( result ) => { console.log( result ) } )
  .catch( ( error ) => { console.log( error ) } )