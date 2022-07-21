import { API_ENDPOINT } from '@env';

export default reqHandler = async ({ apiUrl, params, method, action }) => {
    let response;
    console.log('aaaa', params, method, action, apiUrl);
    try {
        response = await fetch(`https://isnt-kushagra-ag-awesome.netlify.app/api/${apiUrl}`, {
            method,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action,
                ...params
            })
        });

        response = await response.json();
        console.log('resssss', response)

        if (!response || response.errorMessage) throw response?.errorMessage;
    } catch (e) {
        console.error(e);
        return { error: true, msg: 'Please check your internet connection', e };
    }

    return response;
};
