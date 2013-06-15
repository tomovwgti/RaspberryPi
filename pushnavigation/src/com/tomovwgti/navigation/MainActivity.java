
package com.tomovwgti.navigation;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentActivity;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentTransaction;
import android.util.Log;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.WindowManager;
import android.view.WindowManager.LayoutParams;
import android.widget.EditText;
import android.widget.Toast;

import com.google.android.gms.common.GooglePlayServicesNotAvailableException;
import com.google.android.gms.maps.CameraUpdate;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.MapsInitializer;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.BitmapDescriptor;
import com.google.android.gms.maps.model.BitmapDescriptorFactory;
import com.google.android.gms.maps.model.CameraPosition;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.android.gms.maps.model.PolylineOptions;
import com.tomovwgti.json.Msg;
import com.tomovwgti.navigation.SocketIFragment.MessageCallback;
import com.tomovwgti.navigation.SocketIFragment.MessageCallbackPicker;

public class MainActivity extends FragmentActivity implements MessageCallbackPicker,
        MessageCallback {
    static final String TAG = MainActivity.class.getSimpleName();

    private static final String PREF_KEY = "IPADDRESS";
    private AlertDialog mAlertDialog;
    private SharedPreferences mPref;
    private SharedPreferences.Editor mEditor;
    private GoogleMap mMap;
    private Marker mMarker;
    private MarkerOptions mOptions;
    private BitmapDescriptor mIcon;
    private LatLng mPrevLocation;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 起動時にキーボードが開かないように
        this.getWindow().setSoftInputMode(LayoutParams.SOFT_INPUT_STATE_ALWAYS_HIDDEN);
        setContentView(R.layout.map_view);

        { // SocketIOFragmentの作成と登録
            FragmentManager manager = getSupportFragmentManager();
            FragmentTransaction transaction = manager.beginTransaction();
            transaction.add(new SocketIFragment(), "socketio");
            transaction.commit();
        }

        mPref = PreferenceManager.getDefaultSharedPreferences(this);
        mEditor = mPref.edit();

        // Map表示
        mMap = ((SupportMapFragment) getSupportFragmentManager().findFragmentById(R.id.map))
                .getMap();
        try {
            MapsInitializer.initialize(this);
        } catch (GooglePlayServicesNotAvailableException e) {
            Log.d(TAG, "You must update Google Maps.");
            finish();
        }
        mPrevLocation = new LatLng(35.692298, 139.699252);
        mOptions = new MarkerOptions();
        mIcon = BitmapDescriptorFactory.fromResource(R.drawable.cabs);
        mOptions.icon(mIcon);
        mOptions.position(mPrevLocation);
        mMarker = mMap.addMarker(mOptions);
        CameraPosition init = new CameraPosition.Builder().target(mPrevLocation).zoom(16).build();
        CameraUpdate camera = CameraUpdateFactory.newCameraPosition(init);
        mMap.animateCamera(camera);
    }

    @Override
    protected void onResume() {
        super.onResume();
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    }

    @Override
    protected void onPause() {
        super.onPause();
        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    }

    @Override
    protected void onStart() {
        super.onStart();
        if (mPref.getString(PREF_KEY, "").equals("")) {
            // IPアドレス確認ダイアログ
            mAlertDialog = showAlertDialog();
            mAlertDialog.show();
        } else {
            ((SocketIFragment) getFragment()).connectSocketIO(mPref.getString(PREF_KEY, ""));
        }
    }

    @Override
    protected void onStop() {
        super.onStop();
        ((SocketIFragment) getFragment()).disconnectSocketIO();
    }

    @Override
    public MessageCallback getInstance() {
        return this;
    }

    private Fragment getFragment() {
        return getSupportFragmentManager().findFragmentByTag("socketio");
    }

    public AlertDialog showAlertDialog() {
        LayoutInflater factory = LayoutInflater.from(this);
        final View entryView = factory.inflate(R.layout.dialog_entry, null);
        final EditText edit = (EditText) entryView.findViewById(R.id.ip_address);

        if (mPref.getString(PREF_KEY, "").equals("")) {
            edit.setHint("***.***.***.***");
        } else {
            edit.setText(mPref.getString(PREF_KEY, ""));
        }
        // キーハンドリング
        edit.setOnKeyListener(new View.OnKeyListener() {
            public boolean onKey(View v, int keyCode, KeyEvent event) {
                // Enterキーハンドリング
                if (KeyEvent.KEYCODE_ENTER == keyCode) {
                    // 押したときに改行を挿入防止処理
                    if (KeyEvent.ACTION_DOWN == event.getAction()) {
                        return true;
                    }
                    // 離したときにダイアログ上の[OK]処理を実行
                    else if (KeyEvent.ACTION_UP == event.getAction()) {
                        if (edit != null && edit.length() != 0) {
                            // ここで[OK]が押されたときと同じ処理をさせます
                            String editStr = edit.getText().toString();
                            Fragment fragment = getSupportFragmentManager().findFragmentByTag(
                                    "socketio");
                            ((SocketIFragment) fragment).connectSocketIO(editStr);
                            mAlertDialog.dismiss();
                        }
                        return true;
                    }
                }
                return false;
            }
        });

        // AlertDialog作成
        return new AlertDialog.Builder(this).setTitle("Server IP Address").setView(entryView)
                .setPositiveButton("OK", new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int whichButton) {
                        String editStr = edit.getText().toString();
                        // OKボタン押下時のハンドリング
                        mEditor.putString(PREF_KEY, editStr);
                        mEditor.commit();
                        Fragment fragment = getSupportFragmentManager().findFragmentByTag(
                                "socketio");
                        ((SocketIFragment) fragment).connectSocketIO(editStr);
                    }
                }).create();
    }

    /**
     * サーバからのSocket.IOイベント／メッセージ
     */
    @Override
    public void onDisconnect() {
        Toast.makeText(MainActivity.this, "Disconnect", Toast.LENGTH_SHORT).show();
    }

    @Override
    public void onConnect() {
        Toast.makeText(MainActivity.this, "Connect", Toast.LENGTH_SHORT).show();
    }

    @Override
    public void onHertbeat() {
        // TODO Auto-generated method stub

    }

    @Override
    public void onMessage() {
        // TODO Auto-generated method stub

    }

    @Override
    public void onJsonMessage(Msg message) {
        Log.i(TAG, String.valueOf(message.getValue().getLat()));
        Log.i(TAG, String.valueOf(message.getValue().getLon()));
        mMarker.setVisible(false);
        // 現在位置
        LatLng latLng = new LatLng(message.getValue().getLat(), message.getValue().getLon());
        mOptions.position(latLng);
        mMarker = mMap.addMarker(mOptions);
        CameraUpdate cu = CameraUpdateFactory.newLatLng(latLng);
        mMap.animateCamera(cu);
        mMarker.setVisible(true);
        // 線を引く
        mMap.addPolyline(new PolylineOptions().add(mPrevLocation, latLng).width(5)
                .color(Color.BLUE));
        mPrevLocation = latLng;
    }

    @Override
    public void onEvent() {
        // TODO Auto-generated method stub

    }

    @Override
    public void onError() {
        Toast.makeText(MainActivity.this, "Socket.IO Error!", Toast.LENGTH_SHORT).show();
    }

    @Override
    public void onAck() {
        // TODO Auto-generated method stub

    }
}
