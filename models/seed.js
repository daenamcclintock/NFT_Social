///////////////////////////////////////
// Import Dependencies
///////////////////////////////////////
const mongoose = require('./connection')
const Nft = require('./nft')

///////////////////////////////////////////
// Seed Code
////////////////////////////////////////////
// save the connection in a variable
const db = mongoose.connection;

db.on('open', () => {
	// array of starter nfts
	const startNfts = [
		{ name: 'Bored Ape Yacht Club #3953', price: 18622.15, img: 'https://gateway.ipfs.io/ipfs/Qmdd5vDd75VhgYmLY9R26iUXGot4XWjosbPnzFchFWkbVo', scarcityScore: 759.63 },
		{ name: 'Bored Ape Yacht Club #9606', price: 18622.15, img: 'https://gateway.ipfs.io/ipfs/QmPJdawstcjfYwqvqURvCS3EGJHJW66xrDA1apD6YJc89W', scarcityScore: 745.14 },
		{ name: 'Bored Ape Yacht Club #8135', price: 18622.15, img: 'https://gateway.ipfs.io/ipfs/QmerFycLo5q75LuTXyezLUtLo6AkgpJiJxoXAzc3uZKkQw', scarcityScore: 705.39 },
		{ name: 'Bored Ape Yacht Club #2794', price: 18642.40, img: 'https://gateway.ipfs.io/ipfs/Qmaq3k3Noz9J8B7zoZJFE93h8o4nU18LL8VN8wFuAZZ94q', scarcityScore: 644.21 },
		{ name: 'Bored Ape Yacht Club #8976', price: 18642.40, img: 'https://gateway.ipfs.io/ipfs/QmTXFya2cxMgyBfHWNTMucnYgVVAkam2eJXaSfVn2GJQtG', scarcityScore: 639.25 },
	]

	
	// when we seed data, there are a few steps involved
	// delete all the data that already exists(will only happen if data exists)
	Nft.remove({})
        .then(deletedNfts => {
		    console.log('this is what remove returns', deletedNfts)
		    // then we create with our seed data
            Nft.create(startNfts)
                .then((data) => {
                    console.log('Here are the new seed nfts', data)
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
	// then we can send if we want to see that data
})