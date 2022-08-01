const express = require('express');
const Comment = require("../models/commentModel");
const Product = require("../models/productModel");
const Users = require("../models/userModel");
const routes = express.Router();



// GET COMMENTS
routes.get("/comments/:commentId", (req, res) => {
    const commentId = req.params.commentId;
    Comment.find({comment_product_id: commentId, comment_status: true}, (error, data) => {
        if (error) {
            console.log(error);
            res.send("ERROR. Try Again.")
        }
        if (data) {
            console.log(data)
            res.send(data);
        } else {
            res.send("Comments dont found");
        }
    })
})

//ADD COMMENT
routes.post("/comments", async (req, res) => {
    const reqBody = req.body;
    const newComment = new Comment(reqBody);
    const saveNewComment = await newComment.save();
    res.send(saveNewComment || 'Comment not saved');
})

//get product
routes.get("/:productId", (req, res) => {
    const productId = req.params.productId;
    Product.findOne({ _id: productId }, (error, data) => {
        if (error) {
            console.log(error);
            res.send("ERROR. Try Again.")
        }

        if (data) {
            res.send(data);
        } else {
            res.send("Product dont found");
        }
    })
})

routes.put('/set-rating', (req, res) => {
    const allRatings = req.body.allRatings;
    const averageRating = req.body.averageRating;
    const id = req.body.ad._id;

    Product.updateOne(
        { _id: id }, { allRatings: [...allRatings], rating: averageRating },
        null, (error, data) => {
            if (error) throw error;
            res.send(data);
        })
})

routes.get("/shop/product/get-rating/:id", (req, res) => {
    const id = req.params.id;
    Product.find({_id:id},(err,data)=>{
        if (err){
            console.log(err,'greskaaa');
            res.send(err);
        }
        if (data){
            res.send({allRatings: data[0].allRatings, rating:data[0].rating});
        }
    })
});

// * RESET
routes.put('/reset', (req, res) => {
    console.log(req.body);
    // const id = req.body.id
    Users.updateMany({}, { $set: {votedFor: []} }, null, (err, data) => {
        if (err) {
            console.log(err)
            res.send('error je')
        }
        res.send('uspesno')
    })
})

// * DELETE
// routes.put('/delete', (req, res) => {
//     console.log(req.body);
//     // const id = req.body.id
//     Product.updateMany({}, {$unset: {'rate': ''}}, null, (err, data) => {
//         if (err) {
//             console.log(err)
//             res.send('error je')
//         }
//         res.send('uspesno')
//     })
// })

const handleParams = (params) => params?.currentPage ? (params.currentPage < 2 ? 0 : ((params.currentPage - 1) * params.itemsPerPage)) : 0;
//get products
routes.get('/:itemsPerPage/:currentPage', async (req, res) => {
    const reqParams = req.params;
    // console.log('params...', reqParams);

    let allProducts;
    Product.countDocuments({}, function(err, docCount) {
        if (err) { return console.log(err) } //handle possible errors
        allProducts =  docCount;

        Product.find()
            .skip(handleParams(reqParams))
            .limit(isNaN(reqParams?.itemsPerPage) ? 2 : reqParams?.itemsPerPage)
            .exec((error, data) => {
                if (error) {
                    console.log(error);
                    res.send("ERROR. TRY AGAIN.");
                    return;
                }

                if (data) {
                    res.send({ads: data, totalItems: allProducts})
                } else {
                    res.send("Product dont found")
                }
            })
    });
})



module.exports = routes;
