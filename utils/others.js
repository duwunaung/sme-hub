exports.calculatedExpiryDate = () => {
    const now = new Date()
    now.setDate(now.getDate() + 30)
    return now
}