///////////////////////////////////////
// Import Dependencies
///////////////////////////////////////
const mongoose = require('./connection')
const Nft = require('./nft')

///////////////////////////////////////////
// Seed Code
////////////////////////////////////////////

const db = mongoose.connection; // Database connection

db.on('open', () => {
	// array of starter NFTs
	const startNfts = [
		{ name: 'NFT', price: '', image: 'url', scarcityScore: 0 },
		{ name: 'NFT', price: '', image: 'url', scarcityScore: 0 },
		{ name: 'NFT', price: '', image: 'url', scarcityScore: 0 },
		{ name: 'NFT', price: '', image: 'url', scarcityScore: 0 },
		{ name: 'NFT', price: '', image: 'url', scarcityScore: 0 },
	]

	
	// Delete all the data that already exists (will only run if data exists)
	Fruit.remove({})
        .then(deletedNfts => {
		    console.log('this is what remove returns', deletedNfts)
		    // Create seed data
            Fruit.create(startNfts)
                .then((data) => {
                    console.log('Here are the new seed fruits', data)
                    db.close()
                })
                .catch(error => {
                    console.log(error)
                    db.close()
                })
	    })
        .catch(error => {
            console.log(error)
            db.close()
        })
})