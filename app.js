const express = require('express');

const app = express(); //the express() will add a bunch of methods to our app variable

app.get('/', (req, res) => {
    //res.status(200).send('Hello form server side');
    res.status(200).json({ message: 'Hello form server side', app: 'Natours' });
});

app.post('/', (req, res) => {
    res.send('Post to this endpoint');
});

const port = 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}`);
});
