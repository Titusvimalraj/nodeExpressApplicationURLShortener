const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');
const shortid = require('shortid');

const Url = mongoose.model('Url');

const router = express.Router();

router.use(requireAuth);

router.get('/urls', async (req, res) => {
  const urls = await Url.find({ userId: req.user._id });

  res.send(urls);
});

router.get('/:urlId', async (req, res) => {
  const urls = await Url.find({ urlId: req.params.urlId });

  res.redirect(urls[0].url);
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
    const url_ = new Url({ urlId, userId: req.user._id,url });
    await url_.save();
    res.send(url_);
  } catch (err) {
    res.status(422).send({ error: err.message });
  }
});

module.exports = router;
