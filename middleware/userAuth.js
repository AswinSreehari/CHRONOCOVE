const userAuthentication = (async(req,res,next)=>{
    if(req.session && req.session.email){
        next()
    }else{
        res.redirect('/signin')
    }
})

module.exports = {
    userAuthentication
}