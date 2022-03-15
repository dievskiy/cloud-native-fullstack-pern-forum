const MAX_INT_ID = Math.pow(2, 31) - 1

/**
 * Generate a preview text for the post based on its content
 * @param content content of the post
 */
const getPreviewText = (content) => {
    return content.substring(0, 70)
}

module.exports = {
    getPreviewText,
    MAX_INT_ID
}