import { supabase } from './supabase'

const email = ref('')

const handleSignUp = async () => {
  try {
    loading.value = true

    if (!username.value || !email.value || !password.value) {
      throw new Error('Please fill in all fields')
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          username: username.value,
        },
      },
    })

    if (error) throw error

    console.log('User created:', data)
  } catch (error) {
    console.error('Error signing up:', error.message)
  }
}
