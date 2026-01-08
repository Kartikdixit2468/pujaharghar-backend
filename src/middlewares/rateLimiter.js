const {redisClient} = require('../config/redis')

const generalLimiter = async (req, res, next)=> {
    try{
        const identifier = req.ip
        console.log(identifier)
        const timestamp = Date.now();
        const key = `rate:general:${identifier}`;
        const member = `${timestamp}-${Math.random()}`;
        const window = 60 * 1000; // 1 minute
        const LIMIT = 100;

        await redisClient.zremrangebyscore(key, 0, timestamp - window);
        await redisClient.zadd(key, {score: timestamp, value: member});
        const count = await redisClient.zcard(key);
        await redisClient.expire(key, 60); // Set TTL to 60 seconds

        if(count > LIMIT){
            return res.status(429).json({success: "false", error: "Too many requests" })
        }

        next()

    }catch(err){
        console.error("Error in generalLimiter: ", err)
        next()
    }

}

const authLimiter = async (req, res, next) => {
    try{
        const identifier = req.ip
        console.log(identifier)
        const key = `rate:auth:${identifier}`;
        const LIMIT=5;
        const TIME=5*60;
        
        const count  = await redisClient.incr(key);

        if(count === 1){
            await redisClient.expire(key, TIME);
        }

        if(count>LIMIT){
            return res.status(429).json({success: "false", error: "Too many requests" })
        }
        next()
    }
    catch(err){
        console.error("Error in authLimiter: ", err)
        // return res.status(500).json({success: "false", error: "Internal Server Error"})
        next()
    }
}

const OTPLimiter = async (req, res, next) => {

    try{
        const identifier = req.ip
        console.log(identifier)
        const key = `rate:otp:${identifier}`;
        const LIMIT=4;
        const TIME=2*60;

        const count = await redisClient.incr(key);

        if(count === 1){
            await redisClient.expire(key, TIME);
        }

        if(count>LIMIT){
            return res.status(429).json({success: "false", error: "Too many requests" })
        }

        next()
    }
    catch(err){
        console.error("Error in OTPLimiter: ", err)
        // return res.status(500).json({success: "false", error: "Internal Server Error"})
        next()
    }
}

module.exports = {
    generalLimiter,
    authLimiter,
    OTPLimiter
}
