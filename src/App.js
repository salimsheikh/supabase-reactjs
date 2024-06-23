import React, {useEffect, useState} from 'react'
import { supabase } from './lib/helper/supabase_client'

export default function App() {

  //const [email, setEmail] = useState('');
  //const [password, setPassword] = useState('');
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);

    const login = async () => {

      try {
        const { data, error } =await supabase.auth.signInWithOAuth({
          provider: "github",
        });

       
        if (error) {
          console.error('Error signing in:', error.message);
        } else {
          console.log('User signed in:', data);
        }

      } catch (error) {
        console.error('Error during sign in:', error);
      }

    }

    useEffect(() => {
      async function fetchSession() {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error fetching session:', error);
        } else {
          setSession(session);
          setUser(session?.user);

          const {data: authListioner} = supabase.auth.onAuthStateChange(
            (event, session) => {
              switch(event){
                case "SIGNED_IN":                
                  setUser(session?.user);
                  break;
                case "SIGNED_OUT":
                  setUser(null);
                    break;
                default:
                    break;
              }
            }
          );

          return () => {
            authListioner.unsubscribe();
          }
        }
      }  
      fetchSession();
    }, []);

    const logout = async () => {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Error during sign up:', error);
      }
    }

    return (
      <div>

        {user ? (
          <div>
            <h1>User is logged in</h1>
            <button onClick={logout}>Logout</button>
          </div>
        ) : (
          <button onClick={login}>Login via github</button>
        )}
      
      </div>
    )  
  }
