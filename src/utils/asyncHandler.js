 
 
 const asyncHandler  = ( requestHandler ) =>{
    (req, res, next) => {
        Promise.resolve(requesthandler(req, res, next)).
        catch((err) => next(err))
    }
 }







export { asyncHandler }

// const asyncHandler = () => {}
// const asyncHandler = ( fn ) =>  () => {}
//  const asyncHandler = ( fn ) => async () => {}


// const asyncHandler = ( fn ) => async () => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         resizeBy.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
        
//     }
// }
// // higher order function