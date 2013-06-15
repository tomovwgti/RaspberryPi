
package com.tomovwgti.json;

public class Msg {
    private Value value;

    public Msg() {
        value = new Value();
    }

    public Value getValue() {
        return value;
    }

    public void setValue(Value value) {
        this.value = value;
    }

    public class Value {
        private float lat;
        private float lon;

        public float getLat() {
            return lat;
        }

        public void setLat(float lat) {
            this.lat = lat;
        }

        public float getLon() {
            return lon;
        }

        public void setLon(float lon) {
            this.lon = lon;
        }
    }
}
