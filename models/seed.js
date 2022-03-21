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
		{ name: 'Bored Ape Yacht Club #3953', img: 'https://gateway.ipfs.io/ipfs/Qmdd5vDd75VhgYmLY9R26iUXGot4XWjosbPnzFchFWkbVo', scarcityScore: 759.63, openSeaLink: 'https://opensea.io/assets/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/3953' },
		{ name: 'Bored Ape Yacht Club #9606', img: 'https://gateway.ipfs.io/ipfs/QmPJdawstcjfYwqvqURvCS3EGJHJW66xrDA1apD6YJc89W', scarcityScore: 745.14, openSeaLink: 'https://opensea.io/assets/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/9606' },
		{ name: 'Bored Ape Yacht Club #8135', img: 'https://gateway.ipfs.io/ipfs/QmerFycLo5q75LuTXyezLUtLo6AkgpJiJxoXAzc3uZKkQw', scarcityScore: 705.39, openSeaLink: 'https://opensea.io/assets/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/8135' },
		{ name: 'Bored Ape Yacht Club #2794', img: 'https://gateway.ipfs.io/ipfs/Qmaq3k3Noz9J8B7zoZJFE93h8o4nU18LL8VN8wFuAZZ94q', scarcityScore: 644.21, openSeaLink: 'https://opensea.io/assets/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/2794' },
		{ name: 'Bored Ape Yacht Club #8976', img: 'https://gateway.ipfs.io/ipfs/QmTXFya2cxMgyBfHWNTMucnYgVVAkam2eJXaSfVn2GJQtG', scarcityScore: 639.25, openSeaLink: 'https://opensea.io/assets/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/8976' },
		{ name: 'Bored Ape Yacht Club #9984', img: 'https://gateway.ipfs.io/ipfs/QmSQ5bUAZdxT3ny6u7kLWmbGUrvfB8u7R9Fz7vWS3YNunS', scarcityScore: 728.84, openSeaLink: 'https://opensea.io/assets/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/9984' },
		{ name: 'Bored Ape Yacht Club #9581', img: 'https://gateway.ipfs.io/ipfs/QmQBTjAyPUWTSDcPvmgLWj4NYwowGMhwXZP6npy5sgdB2p', scarcityScore: 668.84, openSeaLink: 'https://opensea.io/assets/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/9581' },
		{ name: 'Bored Ape Yacht Club #9999', img: 'https://gateway.ipfs.io/ipfs/QmejYePrutbfWEV8wA3ogTHi2cf2j6hoaPhZSc6vNE43nH', scarcityScore: 665.80, openSeaLink: 'https://opensea.io/assets/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/9999' },
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