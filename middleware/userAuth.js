const userAuthentication = (async(req,res,next)=>{
    if(user.session.email){
        next()
    }else{
        res.redirect('/signin')
    }
})

module.exports = {
    userAuthentication
}