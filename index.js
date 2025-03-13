const express = require("express");
const app = express();
const Sequelize = require("sequelize");

//set project
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//set database
const sequelize = new Sequelize("database", "username", "password", {
    host: "localhost",
    dialect: "sqlite",
    storage: "./database/carrentalsystem.sqlite",
  });

  const users = sequelize.define("users", {
    userid: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
    },
    password: {
      type: Sequelize.STRING,
    },
    role: {
      type: Sequelize.STRING,
    },
  });

  const Game = sequelize.define("Game", {
    gameid: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    gamename: {
      type: Sequelize.STRING,
    },
    urlimage:{
      type: Sequelize.STRING,
    },
    publisher: {
      type: Sequelize.STRING,
    },
  });

  const payment = sequelize.define("payment", {
    paymentid: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    payment_metod: { 
      type: Sequelize.STRING,
    },
    promotion_id: {
        type: Sequelize.INTEGER,
    }
  });

  const promotion = sequelize.define("promotion", {
    promoid: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    promo_name: {
      type: Sequelize.INTEGER,
    },
    discount:{
      type: Sequelize.INTEGER,
    },
    promo_start: {
      type: Sequelize.STRING,
    },
    promo_end: {
        type: Sequelize.STRING,
    },
  });

  const cart = sequelize.define("cart", {
    cartid: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userid: {
      type: Sequelize.INTEGER,
    },
    gameid: {
      type: Sequelize.INTEGER,
    },
    paymentid:{
      type: Sequelize.INTEGER,
    },
    amount:{
      type: Sequelize.INTEGER,
    }
  });
  sequelize.sync();

  app.post("/createuser",async (req,res) => {
    try{
      const {username,email,password} = req.body;

      users.create({username:username,email:email,password:password,role:"user"}).then(data => {
        if (data) {
          res.json();
        }
      }).catch(err => {
        res.status(500).send(err);
      });
    }
    catch(err) {
      res.status(500).send(err);
    }
  });

  app.put("/updateuser/:id",(req,res) => {
    users.findOne({where:{userid:req.params.id}}).then(data => {
      if (data) {
        data.update({role:"admin"});
      }
      else {
        res.status(404).send("user not found");
      }
    }).catch(err => {
      res.status(500).send(err);
    })
  });

  app.post("/login",(req,res) => {
    const {username,password} = req.body;

    users.findOne({where:{username:username,password:password}}).then(data => {
      if (data) {
        res.json({userid:data.userid,login:true,role:data.role});
      }
      else {
        res.json({login:false});
      }
    }).catch(err => {
      res.status(500).send(err);
    });
  });

  app.post("/insertgame",(req,res) => {
    const {gamename,urlimage,publisher} = req.body;

    Game.create({gamename:gamename,urlimage:urlimage,publisher:publisher}).then(data => {
      if (data) {
        res.json();
      }
    }).catch(err => {
      res.status(500).send(err);
    });
  });

  app.get("/getallgame",(req,res) => {
    Game.findAll().then(allgame => {
      if (allgame) {
        res.json(allgame);
      }
      else {
        res.json();
      }
    }).catch(err => {
      res.status(500).send(err);
    });
  });

  app.get("/getgame/:id",(req,res) => {
    Game.findOne({where:{gameid:req.params.id}}).then(data => {
      if (data) {
        res.json(data);
      }
      else {
        res.status(404).send("game not found");
      }
    }).catch(err => {
      res.status(500).send(err);
    })
  });

  app.put("/editgame/:id",(req,res) => {
    const {gamename,urlimage,publisher} = req.body;

    Game.findOne({where:{gameid:req.params.id}}).then( async data => {
      if (data) {
        await data.update({gamename:gamename,urlimage:urlimage,publisher:publisher});
        res.json();
      }
      else {
        res.status(404).send("game not found");
      }
    }).catch(err => {
      res.status(500).send(err);
    })
  });

  app.delete("/deletegame/:id",(req,res) => {
    Game.findOne({where:{gameid:req.params.id}}).then( async data => {
      if (data) {
        await data.destroy();
        res.json();
      }
      else {
        res.status(404).send("game not found");
      }
    }).catch(err => {
      res.status(500).send(err);
    })
  });

  app.post("/createpromotion",(req,res) => {
    const {promo_name,discount,promo_start,promo_end} = req.body;
    const date1 = new Date(promo_start);
    const date2 = new Date(promo_end);

    if (date1 < date2) {
      promotion.create({promo_name:promo_name,discount:discount,promo_start:promo_start,promo_end:promo_end}).then(data => {
        if (data) {
          res.json();
        }
      }).catch(err => {
        res.status(500).send(err);
      })
    }
    else {
      res.json();
    }
  });

  app.get("/getallpromotion",(req,res) => {
    promotion.findAll().then( async data => {
      if (data) {
        const newdata = await Promise.all(data.map( async (e) => {
          if (new Date(e.promo_end) > new Date(Date.now())) {
            return(e);
          }
          else if (new Date(e.promo_end) <= new Date(Date.now())) {
             await e.destroy();
          }
        }));

        res.json(newdata);
      }
      else {
        res.json(data);
      }
    }).catch(err => {
      res.status(500).send(err);
    });
  });

  app.post("/createpayment",(req,res) => {
    const {payment_metod,promotion_id} = req.body;

    payment.create({payment_metod:payment_metod,promotion_id:promotion_id}).then(data => {
      if (data) {
        res.json();
      }
    }).catch(err => {
      res.status(500).send(err);
    });
  });

  app.get("/getallpayment",(req,res) => {
    payment.findAll().then(data => {
      if (data) {
        res.json(data);
      }
      else {
        res.json();
      }
    }).catch(err => {
      res.status(500).send(err);
    });
  });

  app.get("/getpaymentpromotion",(req,res) => {
    payment.belongsTo(promotion,{foreignKey:"promotion_id"});

    payment.findAll({include:[{model:promotion}]}).then(data => {
      if (data) {
        res.json(data);
      }
      else {
        res.json();
      }
    }).catch(err => {
      res.status(500).send(err);
    });
  });

  app.post("/changepromotion/:id",(req,res) => {
    const {promotion_id} = req.body;
    
    payment.findOne({where:{paymentid:req.params.id}}).then( async data => {
      if (data) {
        await data.update({promotion_id:promotion_id});
        res.json();
      }
      else {
        res.status(404).send("not found");
      }
    }).catch(err => {
      res.status(500).send(err);
    });
  });

  app.delete("/deletepayment/:id",(req,res) => {
    payment.findOne({where:{paymentid:req.params.id}}).then( async data => {
      if (data) {
        await data.destroy();
        res.json();
      }
      else {
        res.status(404).send("not found");
      }
    }).catch(err => {
      res.status(500).send(err);
    })
  });

app.post("/insertcart/:gameid", async (req,res) => {
  const {user,payment,package} = req.body;

  cart.create({userid:user.userid,gameid:req.params.gameid,paymentid:payment,amount:package}).then(data => {
    if (data) {
      res.json();
    }
  }).catch(err => {
    res.status(500).send(err);
  })
});

  app.get("/getcart/:userid", async (req,res) => {
    cart.belongsTo(Game,{foreignKey:"gameid"});
    cart.belongsTo(payment,{foreignKey:"paymentid"});
    payment.belongsTo(promotion,{foreignKey:"promotion_id"});

    cart.findAll({where:{userid:req.params.userid},include:[{model:Game},{model:payment,include:[{model:promotion}]}]}).then(data => {
      if (data) {
        res.json(data);
      }
      else {
        res.json();
      }
    }).catch(err => {
      res.status(500).send(err);
    });
  });

  app.delete("/deletecart/:id",(req,res) => {
    cart.findOne().then( async data => {
      if (data) {
        await data.destroy();
        res.json();
      }
      else {
        res.status(404).send("not found");
      }
    }).catch(err => {
      res.status(500).send(err);
    });
  });

  app.delete("/pay/:id",(req,res) => {
    cart.findAll({where:{userid:req.params.id}}).then( async data => {
      if (data) {
        await Promise.all(data.map( async (e) => {
          await e.destroy();
        }));

        res.json();
      }
      else {
        res.json();
      }
    }).catch(err => {
      res.status(500).send(err);
    })
  })

  // const port = process.env.PORT || 3000
  const port = process.env.PORT || 3000
  // app.listen(port, () => console.log(`Listening on port http://localhost:${port}...`))
  app.listen(port, () => console.log(`Listening on port http://localhost:${port}...`))
