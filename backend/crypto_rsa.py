import base64
import os
from pathlib import Path

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa

DATA_DIR = Path(os.getenv("DATA_DIR", Path(__file__).resolve().parent))
KEYS_DIR = DATA_DIR / "keys"
PRIVATE_KEY_PATH = KEYS_DIR / "private.pem"
PUBLIC_KEY_PATH = KEYS_DIR / "public.pem"


def _generate_key_pair() -> tuple[bytes, bytes]:
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend(),
    )
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    public_pem = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    return private_pem, public_pem


def _load_or_create_keys() -> tuple[bytes, bytes]:
    env_private = os.getenv("RSA_PRIVATE_KEY")
    env_public = os.getenv("RSA_PUBLIC_KEY")
    if env_private and env_public:
        return env_private.encode(), env_public.encode()

    if PRIVATE_KEY_PATH.exists() and PUBLIC_KEY_PATH.exists():
        return PRIVATE_KEY_PATH.read_bytes(), PUBLIC_KEY_PATH.read_bytes()

    KEYS_DIR.mkdir(parents=True, exist_ok=True)
    private_pem, public_pem = _generate_key_pair()
    PRIVATE_KEY_PATH.write_bytes(private_pem)
    PUBLIC_KEY_PATH.write_bytes(public_pem)
    return private_pem, public_pem


_private_pem, _public_pem = _load_or_create_keys()
_private_key = serialization.load_pem_private_key(
    _private_pem, password=None, backend=default_backend()
)


def get_public_key_pem() -> str:
    return _public_pem.decode("utf-8")


def decrypt_password(encrypted_b64: str) -> str:
    encrypted = base64.b64decode(encrypted_b64)
    plaintext = _private_key.decrypt(
        encrypted,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None,
        ),
    )
    return plaintext.decode("utf-8")
