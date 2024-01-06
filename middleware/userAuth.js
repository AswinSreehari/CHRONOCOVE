const userAuthentication = (async(req,res,next)=>{
    
    if (req.session && req.session.isBlocked) {
            // return res.json({
            //     isValid: false,
            // });
            // return
            const  error = "Your account has been blocked. Please contact support."
            res.render('User/signin',{error})
    }
    
    if(req.session && req.session.email){
        next()
    }else{
        res.redirect('/signin')
        // res.render('User/signin',{msg})
    }
})

module.exports = {
    userAuthentication
}