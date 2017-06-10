# librarize_me_webservice
NodeJS webservice for the application "Librarize me"

##Librarize.me webservices’ specifications

###Some words about tokens:

This API use Tokens to control the access of the different users.
The idea is simple: when a user connect itself, the API send a unique Token that must be store somewhere on client-side.

This token is used to identify the user and let him (or not) having access to the multiple routes.
So, aside from the creation and the connection routes, all the routes that we are going to show here must have a parameter “token” with the value of the token.

Without it, the route won’t be accessible and the API will throw an error. 


* Users
	* Create a user

  POST
      /users/create
      JSON URL’s parameters example:
      {
        "lastname": "ecalle",
        "firstname": "thomas",
        "pseudo": "sanchyu",
        "password": "bu78ZArd58",
        "email": "thomas@hotmail.fr",
        "phone": "0606060606"
      }

      Informations : 
      •	Lastname and firstname must contain only letters
      •	Pseudo must be unique in database
      •	Email address must be well formed
      •	Password must contain at least 2 minor cases letters, 2 major cases and 2 numbers
      •	Phone number must contain only numbers

  * Connect a user

  POST
      /users/connect
      JSON URL’s parameters example:
      {
        "pseudo": " sanchyu ",
        "password": " bu78ZArd58"
      }

  * Get all users

  GET
      /users


  * Get a user by ID

  GET
      /users/:idOfUSer

  * Modify user’s password

  PUT
      /users/update/password/:newPassword

  * Modify user’s pseudo

  PUT
      /users/update/pseudo/:newPseudo

  * Modify user’s email

  PUT
      /users/update/email/:newEmail

  * Modify user’s firstname

  PUT
      /users/update/firstname/:newFirstName

  * Modify user’s lastname

  PUT
      /users/update/lastname/:newLastName

  * Disconnect active user

  PUT
      /users/deconnect







* Friends

  * Add a friend

  POST
      /users/friends/add/:idOfOtherUser

      Informations:
      When a user add another as a friend, the second one has to accept it in order to validate the friendship, as Facebook’s system.

  * Get all friends’ is of active user

  GET
      /users/friends/all




  * Remove a friend

  DELETE
      /users/friends/remove/:friendID

		



* Products
	
	* Search in amazon

  search books in amazon →
    GET
    /products/amazon/books/:strtofind

  search films in amazon →
    GET
    /products/amazon/films/:strtofind

  search musics in amazon →
    GET
    /products/amazon/music/:strtofind

  search video games in amazon →
    GET
    /products/amazon/game/:strtofind

  get infos of a product from amazon →
    GET
    /products/amazon/:barcode/:barcodetype

	* modify database

  add product to the library of active user →
    POST
    /products/create/:code/:barcodetype

  delete product of the library of active user →
    PUT
    /products/delete/:productid

	* get informations from bdd
	
	get all product for all users →
			GET
			/products/search

	get a particular product →
			GET
			/products/search/:productid

	get products of active user →
			GET
			/products/search/user/active

	get products from a particular user →
			GET
			/products/search/user/:userid

* Loans
	
	* modify database

  create a new loan →
    POST
    /loans/create/:code/:user_id { start_date, end_date }
  end a loan →
    POST
    /loans/end/:code/:user_id { start_date, end_date }
  delete a loan →
    POST
    /loans/delete/:code/:user_id { start_date }

	* get informations from bdd

  get all loans →
    GET
    /loans/search/
  get a loan →
    GET
    /loans/search/:id
  get my loans (owner) →
    GET
    /loans/search/owner/active
  get my loans (loaner) →
    GET
    /loans/search/loaner/active
  get loans from a user (owner) →
    GET
    /loans/search/owner/:user_id
  get loans from a user (loaner) →
    GET
    /loans//search/loaner/:user_id


