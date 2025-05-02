import axios from 'axios'

const ping = async() =>{
    setInterval(async() => {
        try {
                const req = await axios.get(`${process.env.KEEPALIVE}/api/v1/health`,{
                    headers : {
                        'Content-Type' : "application/json"
                    }
                })
                console.log(`✅ Response :`, req?.data?.message);
        } catch (error) {
            console.log(error)
            console.log(`❌ Sorry, the operation failed.`);
        }
    }, 600000);
}

export default ping