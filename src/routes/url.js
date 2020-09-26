const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');
const shortid = require('shortid');

const Url = mongoose.model('Url');

const router = express.Router();

router.get('/:urlId', async (req, res) => {
  try {
    const urls = await Url.find({ urlId: req.params.urlId });  
    res.redirect(urls[0].url);
  } catch (error) {
    return res
    .status(404)
    .send({ error: 'Provided short url not found' });  
  }
});

router.use(requireAuth);

router.get('/urls', async (req, res) => {
  const urls = await Url.find({ userId: req.user._id });

  res.send(urls);
});



router.post('/urls', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res
      .status(422)
      .send({ error: 'You must provide a url parameter in body' });
  }

  try {
    const urlId = shortid.generate();
    const shortUrl = process.env.APPURL ? `${process.env.APPURL}/${urlId}`:`http://localhost:3000/${urlId}`;
    const url_ = new Url({ urlId, userId: req.user._id,url, shortUrl});
    await url_.save();
    res.send(url_);
  } catch (err) {
    res.status(422).send({ error: err.message });
  }
});


router.delete('/:urlId', async (req, res) => {
  const urlId = req.params.urlId;

  if (!urlId) {
    return res
      .status(422)
      .send({ error: 'You must provide a urlId parameter in body' });
  }

  try {   
    
    const mess = await Url.findOneAndRemove({ urlId: req.params.urlId });
    if(!mess){
      return res
      .status(404)
      .send({ error: 'Provided short url not found' });
    }
    res.send({message:'Deleted the Url Successfully',serverMessage:mess});

  } catch (err) {
    res.status(422).send({ error: err.message });
  }
});

module.exports = router;
